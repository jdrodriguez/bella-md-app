import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface TableMenuProps {
  editor: Editor | null
}

interface MenuAction {
  label: string
  icon: LucideIcon
  action: (editor: Editor) => void
  destructive?: boolean
}

type MenuItem = MenuAction | 'divider'

const menuItems: MenuItem[] = [
  {
    label: 'Insert Row Above',
    icon: ArrowUp,
    action: (editor) => editor.chain().focus().addRowBefore().run()
  },
  {
    label: 'Insert Row Below',
    icon: ArrowDown,
    action: (editor) => editor.chain().focus().addRowAfter().run()
  },
  'divider',
  {
    label: 'Insert Column Left',
    icon: ArrowLeft,
    action: (editor) => editor.chain().focus().addColumnBefore().run()
  },
  {
    label: 'Insert Column Right',
    icon: ArrowRight,
    action: (editor) => editor.chain().focus().addColumnAfter().run()
  },
  'divider',
  {
    label: 'Delete Row',
    icon: Trash2,
    action: (editor) => editor.chain().focus().deleteRow().run(),
    destructive: true
  },
  {
    label: 'Delete Column',
    icon: Trash2,
    action: (editor) => editor.chain().focus().deleteColumn().run(),
    destructive: true
  },
  {
    label: 'Delete Table',
    icon: Trash2,
    action: (editor) => editor.chain().focus().deleteTable().run(),
    destructive: true
  }
]

export default function TableMenu({ editor }: TableMenuProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const hide = useCallback(() => setVisible(false), [])

  const handleAction = useCallback(
    (action: (editor: Editor) => void) => {
      if (!editor) return
      action(editor)
      hide()
    },
    [editor, hide]
  )

  useEffect(() => {
    if (!editor) return

    const dom = editor.view.dom

    const handleContextMenu = (e: MouseEvent) => {
      if (!editor.isActive('table')) {
        setVisible(false)
        return
      }

      e.preventDefault()
      setPosition({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }

    dom.addEventListener('contextmenu', handleContextMenu)
    return () => {
      dom.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [editor])

  useEffect(() => {
    if (!visible) return

    const handleClickOutside = () => setVisible(false)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [visible])

  if (!editor) return null
  if (!visible) return null

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[180px] z-50"
      style={{ left: position.x, top: position.y }}
      role="menu"
      aria-label="Table actions"
    >
      {menuItems.map((item, index) => {
        if (item === 'divider') {
          return <div key={index} className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
        }

        const Icon = item.icon

        return (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer min-h-[44px]"
            onClick={() => handleAction(item.action)}
          >
            <Icon
              size={16}
              className={item.destructive ? 'text-red-500' : undefined}
              aria-hidden="true"
            />
            <span className={item.destructive ? 'text-red-500' : undefined}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
