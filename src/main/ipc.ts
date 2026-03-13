import { ipcMain, dialog, shell, BrowserWindow } from 'electron'
import { join, basename, dirname, extname } from 'path'
import fs from 'fs'

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
      const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'document.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })

      if (result.canceled || !result.filePath) {
        return false
      }

      const pdfWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        webPreferences: {
          sandbox: true
        }
      })

      await pdfWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
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
}
