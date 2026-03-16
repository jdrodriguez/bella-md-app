import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
  XCircle
} from 'lucide-react'

interface TableToolbarProps {
  editor: Editor | null
}

function ToolbarButton({
  onClick,
  title,
  destructive,
  children
}: {
  onClick: () => void
  title: string
  destructive?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        destructive
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
}

export default function TableToolbar({ editor }: TableToolbarProps) {
  const [isInTable, setIsInTable] = useState(false)

  useEffect(() => {
    if (!editor) return

    const update = () => {
      setIsInTable(editor.isActive('table'))
    }

    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  if (!editor || !isInTable) return null

  return (
    <div className="flex items-center gap-0.5 px-3 py-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs">
      <span className="text-gray-400 dark:text-gray-500 mr-1 select-none">Table:</span>

      <ToolbarButton
        onClick={() => editor.chain().focus().addRowBefore().run()}
        title="Insert row above"
      >
        <ArrowUp size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().addRowAfter().run()}
        title="Insert row below"
      >
        <ArrowDown size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        title="Insert column left"
      >
        <ArrowLeft size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        title="Insert column right"
      >
        <ArrowRight size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().deleteRow().run()}
        title="Delete row"
        destructive
      >
        <Trash2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().deleteColumn().run()}
        title="Delete column"
        destructive
      >
        <XCircle size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().deleteTable().run()}
        title="Delete table"
        destructive
      >
        <span className="text-xs font-medium">Delete table</span>
      </ToolbarButton>
    </div>
  )
}
