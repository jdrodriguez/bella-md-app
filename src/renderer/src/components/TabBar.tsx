import { useCallback } from 'react'
import { X, Plus, FileText, PanelRightClose } from 'lucide-react'
import { useStore } from '../store'

export default function TabBar() {
  const tabs = useStore((s) => s.tabs)
  const activeTabId = useStore((s) => s.activeTabId)
  const setActiveTab = useStore((s) => s.setActiveTab)
  const closeTab = useStore((s) => s.closeTab)
  const newTab = useStore((s) => s.newTab)
  const toggleTabPanel = useStore((s) => s.toggleTabPanel)

  const handleClose = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      closeTab(id)
    },
    [closeTab]
  )

  return (
    <div className="flex flex-col h-full w-56 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Open Tabs
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={newTab}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title="New Tab"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={toggleTabPanel}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title="Close Panel"
          >
            <PanelRightClose size={14} />
          </button>
        </div>
      </div>

      {/* Tab list */}
      <div className="flex-1 overflow-y-auto py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 mx-1 rounded cursor-pointer text-sm ${
                isActive
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FileText size={14} className="flex-shrink-0" />
              <span className="flex-1 truncate">{tab.title}</span>
              {tab.isDirty && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
              <button
                onClick={(e) => handleClose(e, tab.id)}
                className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 flex-shrink-0"
                title="Close"
              >
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
