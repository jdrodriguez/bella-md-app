/// <reference types="vite/client" />

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  children?: FileEntry[]
}

interface ElectronAPI {
  openFile(): Promise<{ filePath: string; content: string } | null>
  openFolder(): Promise<string | null>
  saveFile(filePath: string, content: string): Promise<boolean>
  saveFileAs(content: string, defaultPath?: string): Promise<{ filePath: string } | null>
  readFile(filePath: string): Promise<string | null>
  readDirectory(dirPath: string): Promise<FileEntry[]>
  watchDirectory(dirPath: string): Promise<boolean>
  unwatchDirectory(dirPath: string): Promise<boolean>
  getRecentFiles(): Promise<string[]>
  showInFolder(filePath: string): void
  exportPDF(html: string, defaultPath?: string): Promise<boolean>
  exportHTML(content: string, defaultPath?: string): Promise<boolean>
  savePastedImage(imageDataUrl: string, documentPath?: string): Promise<{ filePath: string; filename: string } | null>
  setTitle(title: string): void
  getBasename(filePath: string): Promise<string>
  onMenuAction(callback: (action: string) => void): () => void
  onFileOpened(callback: (filePath: string, content: string) => void): () => void
  onDirectoryChanged(callback: (dirPath: string) => void): () => void
}

interface Window {
  api: ElectronAPI
}
