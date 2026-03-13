import { create } from 'zustand'
import { extractFrontmatter } from './lib/frontmatter'

export interface Tab {
  id: string
  filePath: string | null
  title: string
  content: string
  isDirty: boolean
  savedContent: string
  frontmatter: string
}

interface AppState {
  tabs: Tab[]
  activeTabId: string | null

  sidebarOpen: boolean
  sidebarWidth: number
  tabPanelOpen: boolean
  folderPath: string | null
  fileTree: FileEntry[]

  theme: 'light' | 'dark'

  recentFiles: string[]

  newTab: () => void
  openTab: (filePath: string, content: string) => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateContent: (id: string, content: string) => void
  markSaved: (id: string, filePath: string) => void

  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  toggleTabPanel: () => void
  setFolderPath: (path: string | null) => void
  setFileTree: (tree: FileEntry[]) => void

  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void

  addRecentFile: (path: string) => void

  getActiveTab: () => Tab | undefined
}

function createUntitledTab(): Tab {
  return {
    id: crypto.randomUUID(),
    filePath: null,
    title: 'Untitled',
    content: '',
    isDirty: false,
    savedContent: '',
    frontmatter: ''
  }
}

function basename(filePath: string): string {
  const parts = filePath.split('/')
  return parts[parts.length - 1] || filePath
}

function getInitialTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('bella-md-theme')
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // localStorage not available
  }
  return 'light'
}

const initialTab = createUntitledTab()

export const useStore = create<AppState>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,

  sidebarOpen: true,
  sidebarWidth: 250,
  tabPanelOpen: true,
  folderPath: null,
  fileTree: [],

  theme: getInitialTheme(),

  recentFiles: [],

  newTab: () => {
    const tab = createUntitledTab()
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    }))
  },

  openTab: (filePath: string, content: string) => {
    const { tabs } = get()
    const existing = tabs.find((t) => t.filePath === filePath)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }
    const { frontmatter, body } = extractFrontmatter(content)
    const tab: Tab = {
      id: crypto.randomUUID(),
      filePath,
      title: basename(filePath),
      content: body,
      isDirty: false,
      savedContent: body,
      frontmatter
    }
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id
    }))
  },

  closeTab: (id: string) => {
    const { tabs, activeTabId } = get()
    const index = tabs.findIndex((t) => t.id === id)
    if (index === -1) return

    const remaining = tabs.filter((t) => t.id !== id)

    if (remaining.length === 0) {
      const newTab = createUntitledTab()
      set({ tabs: [newTab], activeTabId: newTab.id })
      return
    }

    let nextActiveId = activeTabId
    if (activeTabId === id) {
      // Prefer the tab before, then after
      const nextIndex = index > 0 ? index - 1 : 0
      nextActiveId = remaining[nextIndex].id
    }

    set({ tabs: remaining, activeTabId: nextActiveId })
  },

  setActiveTab: (id: string) => {
    set({ activeTabId: id })
  },

  updateContent: (id: string, content: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id
          ? { ...t, content, isDirty: content !== t.savedContent }
          : t
      )
    }))
  },

  markSaved: (id: string, filePath: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              filePath,
              title: basename(filePath),
              isDirty: false,
              savedContent: t.content
            }
          : t
      )
    }))
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  toggleTabPanel: () => {
    set((state) => ({ tabPanelOpen: !state.tabPanelOpen }))
  },

  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: Math.max(150, Math.min(500, width)) })
  },

  setFolderPath: (path: string | null) => {
    set({ folderPath: path })
  },

  setFileTree: (tree: FileEntry[]) => {
    set({ fileTree: tree })
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light'
    try {
      localStorage.setItem('bella-md-theme', next)
    } catch {
      // localStorage not available
    }
    set({ theme: next })
  },

  setTheme: (theme: 'light' | 'dark') => {
    try {
      localStorage.setItem('bella-md-theme', theme)
    } catch {
      // localStorage not available
    }
    set({ theme })
  },

  addRecentFile: (path: string) => {
    set((state) => {
      const filtered = state.recentFiles.filter((p) => p !== path)
      return { recentFiles: [path, ...filtered].slice(0, 10) }
    })
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find((t) => t.id === activeTabId)
  }
}))
