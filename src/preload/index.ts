import { contextBridge, ipcRenderer } from 'electron'

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
    const handler = (_event: unknown, filePath: string, content: string): void =>
      callback(filePath, content)
    ipcRenderer.on('file-opened', handler)
    return () => ipcRenderer.removeListener('file-opened', handler)
  },
  onDirectoryChanged: (callback: (dirPath: string) => void) => {
    const handler = (_event: unknown, dirPath: string): void => callback(dirPath)
    ipcRenderer.on('directory-changed', handler)
    return () => ipcRenderer.removeListener('directory-changed', handler)
  }
})
