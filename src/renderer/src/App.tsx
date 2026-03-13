import { useEffect, useCallback, useRef, useState } from 'react'
import { PanelLeft, PanelRight } from 'lucide-react'
import { useStore } from './store'
import { prependFrontmatter } from './lib/frontmatter'
import TabBar from './components/TabBar'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import Editor from './components/Editor'
import type { Editor as TiptapEditor } from '@tiptap/react'

export default function App() {
  const theme = useStore((s) => s.theme)
  const sidebarOpen = useStore((s) => s.sidebarOpen)
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const newTab = useStore((s) => s.newTab)
  const openTab = useStore((s) => s.openTab)
  const updateContent = useStore((s) => s.updateContent)
  const markSaved = useStore((s) => s.markSaved)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const tabPanelOpen = useStore((s) => s.tabPanelOpen)
  const toggleTabPanel = useStore((s) => s.toggleTabPanel)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const setFolderPath = useStore((s) => s.setFolderPath)
  const setFileTree = useStore((s) => s.setFileTree)
  const addRecentFile = useStore((s) => s.addRecentFile)

  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(null)
  const editorRef = useRef<TiptapEditor | null>(null)

  // Keep ref in sync for use in async callbacks
  useEffect(() => {
    editorRef.current = editorInstance
  }, [editorInstance])

  const activeTab = tabs.find((t) => t.id === activeTabId)

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Update window title when active tab changes
  useEffect(() => {
    if (activeTab) {
      const dirtyMarker = activeTab.isDirty ? ' \u2014 Edited' : ''
      window.api.setTitle(`${activeTab.title}${dirtyMarker} \u2014 BellaMD`)
    } else {
      window.api.setTitle('BellaMD')
    }
  }, [activeTab?.id, activeTab?.title, activeTab?.isDirty])

  // Save current tab
  const saveCurrentTab = useCallback(async () => {
    const state = useStore.getState()
    const tab = state.getActiveTab()
    if (!tab) return

    const contentToSave = prependFrontmatter(tab.frontmatter, tab.content)

    if (tab.filePath) {
      const success = await window.api.saveFile(tab.filePath, contentToSave)
      if (success) {
        markSaved(tab.id, tab.filePath)
      }
    } else {
      const result = await window.api.saveFileAs(contentToSave)
      if (result) {
        markSaved(tab.id, result.filePath)
        addRecentFile(result.filePath)
      }
    }
  }, [markSaved, addRecentFile])

  // Save as current tab
  const saveAsCurrentTab = useCallback(async () => {
    const state = useStore.getState()
    const tab = state.getActiveTab()
    if (!tab) return

    const contentToSave = prependFrontmatter(tab.frontmatter, tab.content)
    const result = await window.api.saveFileAs(contentToSave, tab.filePath ?? undefined)
    if (result) {
      markSaved(tab.id, result.filePath)
      addRecentFile(result.filePath)
    }
  }, [markSaved, addRecentFile])

  // Handle menu actions from Electron main process
  useEffect(() => {
    const cleanup = window.api.onMenuAction(async (action: string) => {
      switch (action) {
        case 'new-file':
          newTab()
          break

        case 'open-file': {
          const file = await window.api.openFile()
          if (file) {
            openTab(file.filePath, file.content)
            addRecentFile(file.filePath)
          }
          break
        }

        case 'open-folder': {
          const path = await window.api.openFolder()
          if (path) {
            setFolderPath(path)
            try {
              const tree = await window.api.readDirectory(path)
              setFileTree(tree)
              await window.api.watchDirectory(path)
            } catch (err) {
              console.error('Failed to read directory:', err)
            }
          }
          break
        }

        case 'save':
          await saveCurrentTab()
          break

        case 'save-as':
          await saveAsCurrentTab()
          break

        case 'toggle-sidebar':
          toggleSidebar()
          break

        case 'toggle-theme':
          toggleTheme()
          break

        case 'export-pdf': {
          const editor = editorRef.current
          if (editor) {
            const html = editor.getHTML()
            const tab = useStore.getState().getActiveTab()
            await window.api.exportPDF(html, tab?.filePath ?? undefined)
          }
          break
        }

        case 'export-html': {
          const editor = editorRef.current
          if (editor) {
            const html = editor.getHTML()
            const tab = useStore.getState().getActiveTab()
            await window.api.exportHTML(html, tab?.filePath ?? undefined)
          }
          break
        }
      }
    })
    return cleanup
  }, [
    newTab,
    openTab,
    addRecentFile,
    saveCurrentTab,
    saveAsCurrentTab,
    toggleSidebar,
    toggleTheme,
    setFolderPath,
    setFileTree
  ])

  // Handle macOS file open events (double-click .md in Finder)
  useEffect(() => {
    const cleanup = window.api.onFileOpened((filePath: string, content: string) => {
      openTab(filePath, content)
      addRecentFile(filePath)
    })
    return cleanup
  }, [openTab, addRecentFile])

  // Editor content update handler
  const handleEditorUpdate = useCallback(
    (markdown: string) => {
      if (activeTabId) {
        updateContent(activeTabId, markdown)
      }
    },
    [activeTabId, updateContent]
  )

  // Capture editor instance when it mounts/changes
  const handleEditorInstance = useCallback((editor: TiptapEditor | null) => {
    setEditorInstance(editor)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top bar - minimal, just drag region + collapse toggles */}
      <div className="flex items-center justify-between pl-20 pr-3 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 drag-region no-select">
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title={sidebarOpen ? 'Hide Files' : 'Show Files'}
          >
            <PanelLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {activeTab?.title ?? 'BellaMD'}
            {activeTab?.isDirty ? ' \u2022' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={toggleTabPanel}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
            title={tabPanelOpen ? 'Hide Tabs' : 'Show Tabs'}
          >
            <PanelRight size={16} />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab ? (
            <Editor
              key={activeTab.id}
              content={activeTab.content}
              onUpdate={handleEditorUpdate}
              onEditorInstance={handleEditorInstance}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
              No file open
            </div>
          )}
        </div>

        {tabPanelOpen && <TabBar />}
      </div>

      {/* Status bar */}
      <StatusBar editor={editorInstance} />
    </div>
  )
}
