import { FloatingMenu } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface SlashCommandMenuProps {
  editor: Editor | null
}

interface MenuItem {
  label: string
  icon: LucideIcon
  action: (editor: Editor) => void
}

const menuItems: MenuItem[] = [
  {
    label: 'Heading 1',
    icon: Heading1,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    label: 'Heading 2',
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    label: 'Heading 3',
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    label: 'Bullet List',
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run()
  },
  {
    label: 'Numbered List',
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run()
  },
  {
    label: 'Task List',
    icon: ListChecks,
    action: (editor) => editor.chain().focus().toggleTaskList().run()
  },
  {
    label: 'Blockquote',
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run()
  },
  {
    label: 'Code Block',
    icon: Code,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run()
  },
  {
    label: 'Divider',
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run()
  }
]

export default function SlashCommandMenu({ editor }: SlashCommandMenuProps) {
  if (!editor) {
    return null
  }

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'bottom-start' }}
      shouldShow={({ state }) => {
        const { $from } = state.selection
        const currentNode = $from.parent
        const isEmptyParagraph =
          currentNode.type.name === 'paragraph' && currentNode.content.size === 0
        return isEmptyParagraph
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto"
        role="menu"
        aria-label="Insert block element"
      >
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer min-h-[44px]"
            onClick={() => item.action(editor)}
          >
            <item.icon size={16} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </FloatingMenu>
  )
}
