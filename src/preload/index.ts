import { contextBridge, ipcRenderer } from 'electron'

type FileOpenedListener = (filePath: string, content: string) => void

const fileOpenedListeners = new Set<FileOpenedListener>()
let pendingFileOpened: { filePath: string; content: string } | null = null

ipcRenderer.on('file-opened', (_event, filePath: string, content: string) => {
  if (fileOpenedListeners.size === 0) {
    pendingFileOpened = { filePath, content }
    return
  }

  for (const listener of fileOpenedListeners) {
    listener(filePath, content)
  }
})

contextBridge.exposeInMainWorld('api', {
  openFile: () => ipcRenderer.invoke('open-file'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-file', filePath, content),
  saveFileAs: (content: string, defaultPath?: string) =>
    ipcRenderer.invoke('save-file-as', content, defaultPath),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
  watchDirectory: (dirPath: string) => ipcRenderer.invoke('watch-directory', dirPath),
  unwatchDirectory: (dirPath: string) => ipcRenderer.invoke('unwatch-directory', dirPath),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  showInFolder: (filePath: string) => ipcRenderer.send('show-in-folder', filePath),
  exportPDF: (html: string, defaultPath?: string) =>
    ipcRenderer.invoke('export-pdf', html, defaultPath),
  exportHTML: (content: string, defaultPath?: string) =>
    ipcRenderer.invoke('export-html', content, defaultPath),
  exportDOCX: (html: string, defaultPath?: string) =>
    ipcRenderer.invoke('export-docx', html, defaultPath),
  savePastedImage: (imageDataUrl: string, documentPath?: string) =>
    ipcRenderer.invoke('save-pasted-image', imageDataUrl, documentPath),
  setTitle: (title: string) => ipcRenderer.send('set-title', title),
  getBasename: (filePath: string) => ipcRenderer.invoke('get-basename', filePath),
  onMenuAction: (callback: (action: string) => void) => {
    const handler = (_event: unknown, action: string): void => callback(action)
    ipcRenderer.on('menu-action', handler)
    return () => ipcRenderer.removeListener('menu-action', handler)
  },
  onFileOpened: (callback: (filePath: string, content: string) => void) => {
    fileOpenedListeners.add(callback)

    if (pendingFileOpened) {
      const { filePath, content } = pendingFileOpened
      pendingFileOpened = null

      queueMicrotask(() => {
        if (fileOpenedListeners.has(callback)) {
          callback(filePath, content)
        }
      })
    }

    return () => fileOpenedListeners.delete(callback)
  },
  getPendingFile: () => ipcRenderer.invoke('get-pending-file'),
  onDirectoryChanged: (callback: (dirPath: string) => void) => {
    const handler = (_event: unknown, dirPath: string): void => callback(dirPath)
    ipcRenderer.on('directory-changed', handler)
    return () => ipcRenderer.removeListener('directory-changed', handler)
  },

  // License
  activateLicense: (licenseKey: string) => ipcRenderer.invoke('license:activate', licenseKey),
  validateLicense: () => ipcRenderer.invoke('license:validate'),
  deactivateLicense: () => ipcRenderer.invoke('license:deactivate'),
  getLicenseKey: () => ipcRenderer.invoke('license:get-key'),
  getMachineId: () => ipcRenderer.invoke('license:get-machine-id')
})
