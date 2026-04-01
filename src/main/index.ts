import { app, BrowserWindow, ipcMain, Menu, MenuItem, nativeImage } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { is } from '@electron-toolkit/utils'
import { setupMenu } from './menu'
import { setupIPC } from './ipc'

let mainWindow: BrowserWindow | null = null
let pendingFilePath: string | null = null

// macOS: open-file can fire before app.whenReady(), so register early
app.on('open-file', (event, filePath) => {
  event.preventDefault()

  if (mainWindow && !mainWindow.isDestroyed()) {
    sendFileToRenderer(filePath)
  } else {
    pendingFilePath = filePath
  }
})

function sendFileToRenderer(filePath: string): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  fs.promises
    .readFile(filePath, 'utf-8')
    .then((content) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('file-opened', filePath, content)
      }
    })
    .catch(() => {
      // File could not be read
    })
}

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

// Single instance lock — on Windows/Linux, prevent duplicate app windows
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}

// On Windows/Linux, file paths are passed as CLI arguments
function getFileFromArgs(argv: string[]): string | null {
  // Skip the executable and any electron flags; look for a .md/.markdown/.txt path
  const fileArg = argv.find((arg, i) => {
    if (i === 0) return false // executable
    if (arg.startsWith('-')) return false // flag
    return /\.(md|markdown|txt)$/i.test(arg)
  })
  return fileArg ?? null
}

// Renderer calls this after App mounts to collect any file that triggered the launch
ipcMain.handle('get-pending-file', async () => {
  if (!pendingFilePath) return null
  const filePath = pendingFilePath
  pendingFilePath = null
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8')
    return { filePath, content }
  } catch {
    return null
  }
})

app.whenReady().then(() => {
  setupIPC()
  createWindow()

  // Check CLI args on Windows/Linux for file opened via double-click
  if (process.platform !== 'darwin') {
    const fileFromArgs = getFileFromArgs(process.argv)
    if (fileFromArgs) {
      pendingFilePath = fileFromArgs
    }
  }

  // Handle second-instance on Windows/Linux (single-instance lock)
  app.on('second-instance', (_event, argv) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      const filePath = getFileFromArgs(argv)
      if (filePath) {
        sendFileToRenderer(filePath)
      }
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
