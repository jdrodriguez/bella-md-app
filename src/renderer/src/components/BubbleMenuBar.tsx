import { BubbleMenu } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, Underline, Strikethrough } from 'lucide-react'
import { NodeSelection } from '@tiptap/pm/state'

interface BubbleMenuBarProps {
  editor: Editor | null
}

function BubbleToolbarButton({
  onClick,
  isActive = false,
  title,
  children
}: {
  onClick: () => void
  isActive?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

export default function BubbleMenuBar({ editor }: BubbleMenuBarProps) {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150 }}
      shouldShow={({ editor: ed, view, state, from, to }) => {
        // Don't show on empty selections
        if (from === to) return false

        // Don't show on node selections (e.g. images)
        if (state.selection instanceof NodeSelection) return false

        // Don't show when editor is not editable
        if (!ed.isEditable) return false

        // Don't show inside code blocks
        if (ed.isActive('codeBlock')) return false

        // Only show when there is actual text content selected
        const hasTextContent = !state.selection.empty
        return hasTextContent
      }}
    >
      <div className="flex items-center gap-0.5 px-1.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
        <BubbleToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </BubbleToolbarButton>
        <BubbleToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </BubbleToolbarButton>
        <BubbleToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <Underline size={16} />
        </BubbleToolbarButton>
        <BubbleToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </BubbleToolbarButton>
      </div>
    </BubbleMenu>
  )
}
