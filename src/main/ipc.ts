import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { join, basename, dirname, extname } from 'path'
import fs from 'fs'
import HTMLtoDOCX from 'html-to-docx'

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  children?: FileEntry[]
}

const recentFiles: string[] = []
const watchers: Map<string, fs.FSWatcher> = new Map()
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map()

function addRecentFile(filePath: string): void {
  const index = recentFiles.indexOf(filePath)
  if (index !== -1) {
    recentFiles.splice(index, 1)
  }
  recentFiles.unshift(filePath)
  if (recentFiles.length > 10) {
    recentFiles.pop()
  }
}

export function setupIPC(): void {
  ipcMain.handle('open-file', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      const filePath = result.filePaths[0]
      const content = await fs.promises.readFile(filePath, 'utf-8')
      addRecentFile(filePath)
      return { filePath, content }
    } catch (error) {
      console.error('Failed to open file:', error)
      return null
    }
  })

  ipcMain.handle('open-folder', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      return result.filePaths[0]
    } catch (error) {
      console.error('Failed to open folder:', error)
      return null
    }
  })

  ipcMain.handle('save-file', async (_event, filePath: string, content: string) => {
    try {
      await fs.promises.writeFile(filePath, content, 'utf-8')
      addRecentFile(filePath)
      return true
    } catch (error) {
      console.error('Failed to save file:', error)
      return false
    }
  })

  ipcMain.handle('save-file-as', async (_event, content: string, defaultPath?: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'untitled.md',
        filters: [{ name: 'Markdown', extensions: ['md'] }]
      })

      if (result.canceled || !result.filePath) {
        return null
      }

      await fs.promises.writeFile(result.filePath, content, 'utf-8')
      addRecentFile(result.filePath)
      return { filePath: result.filePath }
    } catch (error) {
      console.error('Failed to save file as:', error)
      return null
    }
  })

  ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8')
      return content
    } catch (error) {
      console.error('Failed to read file:', error)
      return null
    }
  })

  ipcMain.handle('read-directory', async (_event, dirPath: string) => {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
      const fileEntries: FileEntry[] = []

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue

        const entryPath = join(dirPath, entry.name)

        if (entry.isDirectory()) {
          // Read one level deep
          const children: FileEntry[] = []
          try {
            const subEntries = await fs.promises.readdir(entryPath, { withFileTypes: true })
            for (const subEntry of subEntries) {
              if (subEntry.name.startsWith('.')) continue
              const subPath = join(entryPath, subEntry.name)

              if (subEntry.isDirectory()) {
                children.push({
                  name: subEntry.name,
                  path: subPath,
                  isDirectory: true
                })
              } else {
                const ext = extname(subEntry.name).toLowerCase()
                if (ext === '.md' || ext === '.markdown') {
                  children.push({
                    name: subEntry.name,
                    path: subPath,
                    isDirectory: false
                  })
                }
              }
            }
          } catch {
            // Could not read subdirectory
          }

          // Sort children: directories first, then files, alphabetical
          children.sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1
            if (!a.isDirectory && b.isDirectory) return 1
            return a.name.localeCompare(b.name)
          })

          fileEntries.push({
            name: entry.name,
            path: entryPath,
            isDirectory: true,
            children
          })
        } else {
          const ext = extname(entry.name).toLowerCase()
          if (ext === '.md' || ext === '.markdown') {
            fileEntries.push({
              name: entry.name,
              path: entryPath,
              isDirectory: false
            })
          }
        }
      }

      // Sort: directories first, then files, alphabetical
      fileEntries.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })

      return fileEntries
    } catch (error) {
      console.error('Failed to read directory:', error)
      return []
    }
  })

  ipcMain.handle('watch-directory', async (event, dirPath: string) => {
    try {
      // Clean up existing watcher for this path
      if (watchers.has(dirPath)) {
        watchers.get(dirPath)!.close()
        watchers.delete(dirPath)
      }

      const watcher = fs.watch(dirPath, { recursive: true }, () => {
        // Debounce to avoid flooding
        const existingTimer = debounceTimers.get(dirPath)
        if (existingTimer) {
          clearTimeout(existingTimer)
        }

        const timer = setTimeout(() => {
          debounceTimers.delete(dirPath)
          try {
            event.sender.send('directory-changed', dirPath)
          } catch {
            // Window may have been closed
          }
        }, 500)

        debounceTimers.set(dirPath, timer)
      })

      watchers.set(dirPath, watcher)
      return true
    } catch (error) {
      console.error('Failed to watch directory:', error)
      return false
    }
  })

  ipcMain.handle('unwatch-directory', async (_event, dirPath: string) => {
    try {
      if (watchers.has(dirPath)) {
        watchers.get(dirPath)!.close()
        watchers.delete(dirPath)
      }

      const existingTimer = debounceTimers.get(dirPath)
      if (existingTimer) {
        clearTimeout(existingTimer)
        debounceTimers.delete(dirPath)
      }

      return true
    } catch (error) {
      console.error('Failed to unwatch directory:', error)
      return false
    }
  })

  ipcMain.handle('get-recent-files', async () => {
    return recentFiles
  })

  ipcMain.on('show-in-folder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('export-pdf', async (_event, html: string, defaultPath?: string) => {
    try {
      const defaultName = defaultPath
        ? basename(defaultPath, extname(defaultPath)) + '.pdf'
        : 'document.pdf'

      const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })

      if (result.canceled || !result.filePath) {
        return false
      }

      const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #1a1a1a;
      max-width: 100%;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; }
    h1 { font-size: 2.25em; margin: 1em 0 0.5em; line-height: 1.2; }
    h2 { font-size: 1.75em; margin: 0.8em 0 0.4em; line-height: 1.3; }
    h3 { font-size: 1.375em; margin: 0.6em 0 0.3em; line-height: 1.4; }
    h4 { font-size: 1.125em; margin: 0.5em 0 0.25em; }
    h5 { font-size: 1em; margin: 0.5em 0 0.25em; }
    h6 { font-size: 0.875em; margin: 0.5em 0 0.25em; text-transform: uppercase; letter-spacing: 0.05em; }
    p { margin: 0.5em 0; }
    a { color: #2563eb; text-decoration: underline; }
    ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
    ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.25em 0; }
    li > p { margin: 0; }
    /* Task lists */
    ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;
    }
    ul[data-type="taskList"] li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 0.35em 0;
    }
    ul[data-type="taskList"] li > label {
      flex-shrink: 0;
      margin-top: 3px;
    }
    ul[data-type="taskList"] li > label input[type="checkbox"] {
      width: 14px;
      height: 14px;
      accent-color: #2563eb;
    }
    ul[data-type="taskList"] li > div {
      flex: 1;
      min-width: 0;
    }
    blockquote {
      border-left: 3px solid #d1d5db;
      padding-left: 1em;
      margin: 1em 0;
      color: #6b7280;
      font-style: italic;
    }
    code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      margin: 1em 0;
      font-family: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.6;
    }
    pre code { background: none; padding: 0; border-radius: 0; font-size: inherit; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    hr { border: none; border-top: 2px solid #e5e7eb; margin: 2em 0; }
    img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; }
    mark { background-color: #fef08a; padding: 1px 2px; border-radius: 2px; }
    sup { font-size: 0.75em; }
    sub { font-size: 0.75em; }
  </style>
</head>
<body>${html}</body>
</html>`

      const pdfWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        webPreferences: {
          sandbox: true
        }
      })

      await pdfWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(styledHtml)}`
      )

      const pdfData = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        margins: {
          marginType: 'custom',
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5
        }
      })

      await fs.promises.writeFile(result.filePath, pdfData)
      pdfWindow.close()
      return true
    } catch (error) {
      console.error('Failed to export PDF:', error)
      return false
    }
  })

  ipcMain.handle('export-html', async (_event, content: string, defaultPath?: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'document.html',
        filters: [{ name: 'HTML', extensions: ['html'] }]
      })

      if (result.canceled || !result.filePath) {
        return false
      }

      const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    h1 { font-size: 2em; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-bottom: 1em; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    pre {
      background: #f6f8fa;
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1em;
    }
    pre code { background: none; padding: 0; }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding: 0.5em 1em;
      margin: 0 0 1em 0;
      color: #6a737d;
    }
    ul, ol { margin-bottom: 1em; padding-left: 2em; }
    li { margin-bottom: 0.25em; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2em 0; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #dfe2e5; padding: 0.5em 1em; text-align: left; }
    th { background: #f6f8fa; font-weight: 600; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${content}
</body>
</html>`

      await fs.promises.writeFile(result.filePath, htmlTemplate, 'utf-8')
      return true
    } catch (error) {
      console.error('Failed to export HTML:', error)
      return false
    }
  })

  ipcMain.handle('export-docx', async (_event, html: string, defaultPath?: string) => {
    try {
      const defaultName = defaultPath
        ? basename(defaultPath, extname(defaultPath)) + '.docx'
        : 'document.docx'

      const result = await dialog.showSaveDialog({
        defaultPath: defaultName,
        filters: [{ name: 'Word Document', extensions: ['docx'] }]
      })

      if (result.canceled || !result.filePath) {
        return false
      }

      const htmlTemplate = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>${html}</body>
</html>`

      const docxBuffer = await HTMLtoDOCX(htmlTemplate, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true
      })

      await fs.promises.writeFile(result.filePath, docxBuffer as Buffer)
      return true
    } catch (error) {
      console.error('Failed to export DOCX:', error)
      return false
    }
  })

  ipcMain.handle(
    'save-pasted-image',
    async (_event, imageDataUrl: string, documentPath?: string) => {
      try {
        // Determine save directory: same as document, or ask user
        let saveDir: string
        if (documentPath) {
          saveDir = dirname(documentPath)
        } else {
          const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Choose where to save the image'
          })
          if (result.canceled || result.filePaths.length === 0) return null
          saveDir = result.filePaths[0]
        }

        // Parse the data URL
        const matches = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
        if (!matches) return null

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // Generate filename: image-YYYYMMDDHHMMSS.ext
        const now = new Date()
        const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14)
        const filename = `image-${timestamp}.${ext}`
        const filePath = join(saveDir, filename)

        await fs.promises.writeFile(filePath, buffer)

        return { filePath, filename }
      } catch (error) {
        console.error('Failed to save pasted image:', error)
        return null
      }
    }
  )

  ipcMain.on('set-title', (_event, title: string) => {
    const window = BrowserWindow.getFocusedWindow()
    if (window) {
      window.setTitle(title)
    }
  })

  ipcMain.handle('get-basename', async (_event, filePath: string) => {
    return basename(filePath)
  })

  // License handlers
  ipcMain.handle('license:activate', async (_event, licenseKey: string) => {
    const { activateLicense } = await import('./license')
    return activateLicense(licenseKey)
  })

  ipcMain.handle('license:validate', async () => {
    const { validateLicense } = await import('./license')
    return validateLicense()
  })

  ipcMain.handle('license:deactivate', async () => {
    const { deactivateDevice } = await import('./license')
    return deactivateDevice()
  })

  ipcMain.handle('license:get-key', async () => {
    const { getStoredLicenseKey } = await import('./license')
    return getStoredLicenseKey()
  })

  ipcMain.handle('license:get-machine-id', async () => {
    const { getMachineId } = await import('./license')
    return getMachineId()
  })
}
