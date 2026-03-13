import { Sun, Moon } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { useStore } from '../store'

interface StatusBarProps {
  editor: Editor | null
}

export default function StatusBar({ editor }: StatusBarProps) {
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)

  const words = editor?.storage.characterCount?.words?.() ?? 0
  const characters = editor?.storage.characterCount?.characters?.() ?? 0

  // Approximate line/column from selection
  let line = 1
  let column = 1
  if (editor) {
    const { from } = editor.state.selection
    const doc = editor.state.doc
    let pos = 0
    doc.descendants((node, nodePos) => {
      if (nodePos >= from) return false
      if (node.isBlock && nodePos < from) {
        line++
        pos = nodePos
      }
      return true
    })
    column = from - pos
    if (column < 1) column = 1
  }

  return (
    <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 no-select">
      <div className="flex items-center gap-3">
        <span>{words} words</span>
        <span>{characters} characters</span>
      </div>

      <div className="flex items-center gap-3">
        <span>
          Ln {line}, Col {column}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span>Markdown</span>
        <button
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>
    </div>
  )
}
