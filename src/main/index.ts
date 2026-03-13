import { app, BrowserWindow, Menu, MenuItem, nativeImage } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'
import { setupMenu } from './menu'
import { setupIPC } from './ipc'

let mainWindow: BrowserWindow | null = null

const prefsPath = (): string => join(app.getPath('userData'), 'preferences.json')

function loadPrefs(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(prefsPath(), 'utf-8'))
  } catch {
    return {}
  }
}

function savePref(key: string, value: unknown): void {
  const prefs = loadPrefs()
  prefs[key] = value
  fs.writeFileSync(prefsPath(), JSON.stringify(prefs, null, 2), 'utf-8')
}

function getIconPath(): string {
  if (is.dev) {
    return join(app.getAppPath(), 'resources', 'icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

function createWindow(): BrowserWindow {
  const iconPath = getIconPath()
  const icon = nativeImage.createFromPath(iconPath)

  if (process.platform === 'darwin') {
    app.dock.setIcon(icon)
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      spellcheck: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  const savedLang = (loadPrefs().spellcheckLang as string) || 'en-US'
  const available = mainWindow.webContents.session.availableSpellCheckerLanguages
  const currentLang = available.includes(savedLang) ? savedLang : 'en-US'
  mainWindow.webContents.session.setSpellCheckerLanguages([currentLang])

  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu()

    for (const suggestion of params.dictionarySuggestions) {
      menu.append(
        new MenuItem({
          label: suggestion,
          click: () => mainWindow!.webContents.replaceMisspelling(suggestion)
        })
      )
    }

    if (params.misspelledWord) {
      if (params.dictionarySuggestions.length > 0) {
        menu.append(new MenuItem({ type: 'separator' }))
      }
      menu.append(
        new MenuItem({
          label: 'Add to Dictionary',
          click: () =>
            mainWindow!.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
        })
      )
    }

    if (menu.items.length > 0) {
      menu.popup()
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']!)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  function rebuildMenu(lang: string): void {
    setupMenu(mainWindow!, {
      availableLanguages: available,
      currentLanguage: lang,
      onLanguageChange: (newLang: string) => {
        mainWindow!.webContents.session.setSpellCheckerLanguages([newLang])
        savePref('spellcheckLang', newLang)
        rebuildMenu(newLang)
      }
    })
  }

  rebuildMenu(currentLang)

  return mainWindow
}

app.whenReady().then(() => {
  setupIPC()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('open-file', (_event, filePath) => {
  _event.preventDefault()
  if (mainWindow) {
    fs.promises
      .readFile(filePath, 'utf-8')
      .then((content) => {
        mainWindow!.webContents.send('file-opened', filePath, content)
      })
      .catch(() => {
        // File could not be read
      })
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
