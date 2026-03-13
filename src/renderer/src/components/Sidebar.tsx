import { useState, useCallback, useEffect, useRef } from 'react'
import {
  FolderOpen,
  Folder,
  FileText,
  File,
  ChevronRight,
  ChevronDown,
  FolderPlus
} from 'lucide-react'
import { useStore } from '../store'

function FileTreeItem({
  entry,
  depth,
  expanded,
  onToggle,
  onFileClick,
  activeFilePath
}: {
  entry: FileEntry
  depth: number
  expanded: Set<string>
  onToggle: (path: string) => void
  onFileClick: (path: string) => void
  activeFilePath: string | null
}) {
  const isExpanded = expanded.has(entry.path)
  const isActive = entry.path === activeFilePath
  const isMarkdown = !entry.isDirectory && /\.(md|mdx|markdown|txt)$/i.test(entry.name)

  const handleClick = () => {
    if (entry.isDirectory) {
      onToggle(entry.path)
    } else {
      onFileClick(entry.path)
    }
  }

  return (
    <>
      <button
        className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm cursor-pointer w-full text-left ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={handleClick}
        title={entry.path}
      >
        {entry.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} className="shrink-0 text-gray-400" />
            ) : (
              <ChevronRight size={14} className="shrink-0 text-gray-400" />
            )}
            {isExpanded ? (
              <FolderOpen size={16} className="shrink-0 text-yellow-600 dark:text-yellow-500" />
            ) : (
              <Folder size={16} className="shrink-0 text-yellow-600 dark:text-yellow-500" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            {isMarkdown ? (
              <FileText size={16} className="shrink-0 text-blue-500 dark:text-blue-400" />
            ) : (
              <File size={16} className="shrink-0 text-gray-400" />
            )}
          </>
        )}
        <span className="truncate">{entry.name}</span>
      </button>
      {entry.isDirectory && isExpanded && entry.children && (
        <>
          {entry.children.map((child) => (
            <FileTreeItem
              key={child.path}
              entry={child}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
            />
          ))}
        </>
      )}
    </>
  )
}

export default function Sidebar() {
  const folderPath = useStore((s) => s.folderPath)
  const fileTree = useStore((s) => s.fileTree)
  const sidebarWidth = useStore((s) => s.sidebarWidth)
  const setSidebarWidth = useStore((s) => s.setSidebarWidth)
  const setFolderPath = useStore((s) => s.setFolderPath)
  const setFileTree = useStore((s) => s.setFileTree)
  const openTab = useStore((s) => s.openTab)
  const addRecentFile = useStore((s) => s.addRecentFile)
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const resizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const activeFilePath = activeTab?.filePath ?? null

  const folderName = folderPath ? folderPath.split('/').pop() || folderPath : null

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const handleFileClick = useCallback(
    async (filePath: string) => {
      try {
        const content = await window.api.readFile(filePath)
        if (content === null) {
          console.error('Failed to read file: returned null for', filePath)
          return
        }
        openTab(filePath, content)
        addRecentFile(filePath)
      } catch (err) {
        console.error('Failed to read file:', err)
      }
    },
    [openTab, addRecentFile]
  )

  const handleOpenFolder = useCallback(async () => {
    const path = await window.api.openFolder()
    if (!path) return
    setFolderPath(path)
    try {
      const tree = await window.api.readDirectory(path)
      setFileTree(tree)
      await window.api.watchDirectory(path)
    } catch (err) {
      console.error('Failed to read directory:', err)
    }
  }, [setFolderPath, setFileTree])

  // Refresh tree when directory changes
  useEffect(() => {
    if (!folderPath) return
    const cleanup = window.api.onDirectoryChanged(async (dirPath: string) => {
      if (dirPath === folderPath) {
        try {
          const tree = await window.api.readDirectory(folderPath)
          setFileTree(tree)
        } catch (err) {
          console.error('Failed to refresh directory:', err)
        }
      }
    })
    return cleanup
  }, [folderPath, setFileTree])

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (folderPath) {
        window.api.unwatchDirectory(folderPath)
      }
    }
  }, [folderPath])

  // Resize handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      resizing.current = true
      startX.current = e.clientX
      startWidth.current = sidebarWidth
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'

      const handleMouseMove = (ev: MouseEvent) => {
        if (!resizing.current) return
        const delta = ev.clientX - startX.current
        setSidebarWidth(startWidth.current + delta)
      }

      const handleMouseUp = () => {
        resizing.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [sidebarWidth, setSidebarWidth]
  )

  return (
    <div className="flex h-full">
      <div
        className="flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden no-select"
        style={{ width: sidebarWidth }}
      >
        {folderPath ? (
          <>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <span className="truncate">{folderName}</span>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={handleOpenFolder}
                title="Open Another Folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-1 py-1">
              {fileTree.map((entry) => (
                <FileTreeItem
                  key={entry.path}
                  entry={entry}
                  depth={0}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onFileClick={handleFileClick}
                  activeFilePath={activeFilePath}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
            <FolderOpen size={40} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No folder open</p>
            <button
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
              onClick={handleOpenFolder}
            >
              Open Folder
            </button>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div className="resize-handle" onMouseDown={handleMouseDown} />
    </div>
  )
}
