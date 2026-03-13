import { useState, useRef, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Superscript,
  Subscript,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus,
  Table,
  Link,
  ImageIcon,
  Smile,
  Palette,
  Undo,
  Redo,
  X
} from 'lucide-react'
import EmojiPicker from './EmojiPicker'
import ColorPicker from './ColorPicker'

interface ToolbarProps {
  editor: Editor | null
}

interface InputDialogConfig {
  title: string
  placeholder: string
  defaultValue?: string
  onSubmit: (value: string) => void
}

function InputDialog({
  config,
  onClose
}: {
  config: InputDialogConfig
  onClose: () => void
}) {
  const [value, setValue] = useState(config.defaultValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (trimmed) {
      config.onSubmit(trimmed)
    }
    onClose()
  }, [value, config, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-96 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{config.title}</h3>
          <button
            onClick={onClose}
            className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') onClose()
          }}
          placeholder={config.placeholder}
          className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
        />
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-500 hover:bg-blue-600 text-white"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
}

export default function Toolbar({ editor }: ToolbarProps) {
  const [showEmoji, setShowEmoji] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [dialog, setDialog] = useState<InputDialogConfig | null>(null)
  const disabled = !editor

  function handleLink() {
    if (!editor) return
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const currentHref = editor.getAttributes('link').href ?? ''
    setDialog({
      title: 'Insert Link',
      placeholder: 'https://example.com',
      defaultValue: currentHref,
      onSubmit: (url) => {
        editor.chain().focus().setLink({ href: url }).run()
      }
    })
  }

  function handleImage() {
    if (!editor) return
    setDialog({
      title: 'Insert Image',
      placeholder: 'https://example.com/image.png',
      onSubmit: (url) => {
        editor.chain().focus().setImage({ src: url }).run()
      }
    })
  }

  function handleEmojiSelect(emoji: string) {
    if (!editor) return
    editor.chain().focus().insertContent(emoji).run()
  }

  return (
    <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-wrap">
      {/* Group 1 - Text formatting */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive('bold') ?? false}
        disabled={disabled}
        title="Bold"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive('italic') ?? false}
        disabled={disabled}
        title="Italic"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        isActive={editor?.isActive('underline') ?? false}
        disabled={disabled}
        title="Underline"
      >
        <Underline size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        isActive={editor?.isActive('strike') ?? false}
        disabled={disabled}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 2 - Special formatting */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHighlight().run()}
        isActive={editor?.isActive('highlight') ?? false}
        disabled={disabled}
        title="Highlight"
      >
        <Highlighter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleSuperscript().run()}
        isActive={editor?.isActive('superscript') ?? false}
        disabled={disabled}
        title="Superscript"
      >
        <Superscript size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleSubscript().run()}
        isActive={editor?.isActive('subscript') ?? false}
        disabled={disabled}
        title="Subscript"
      >
        <Subscript size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 3 - Headings */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor?.isActive('heading', { level: 1 }) ?? false}
        disabled={disabled}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor?.isActive('heading', { level: 2 }) ?? false}
        disabled={disabled}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor?.isActive('heading', { level: 3 }) ?? false}
        disabled={disabled}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 4 - Text alignment */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        isActive={editor?.isActive({ textAlign: 'left' }) ?? false}
        disabled={disabled}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        isActive={editor?.isActive({ textAlign: 'center' }) ?? false}
        disabled={disabled}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        isActive={editor?.isActive({ textAlign: 'right' }) ?? false}
        disabled={disabled}
        title="Align Right"
      >
        <AlignRight size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 5 - Lists */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive('bulletList') ?? false}
        disabled={disabled}
        title="Bullet List"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive('orderedList') ?? false}
        disabled={disabled}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleTaskList().run()}
        isActive={editor?.isActive('taskList') ?? false}
        disabled={disabled}
        title="Task List"
      >
        <ListChecks size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 6 - Block elements */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        isActive={editor?.isActive('blockquote') ?? false}
        disabled={disabled}
        title="Blockquote"
      >
        <Quote size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        isActive={editor?.isActive('codeBlock') ?? false}
        disabled={disabled}
        title="Code Block"
      >
        <Code size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
        title="Horizontal Rule"
      >
        <Minus size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        disabled={disabled}
        title="Insert Table"
      >
        <Table size={18} />
      </ToolbarButton>

      <Divider />

      {/* Group 7 - Insert */}
      <ToolbarButton
        onClick={handleLink}
        isActive={editor?.isActive('link') ?? false}
        disabled={disabled}
        title="Link"
      >
        <Link size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={handleImage} disabled={disabled} title="Image">
        <ImageIcon size={18} />
      </ToolbarButton>
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowEmoji((prev) => !prev)}
          disabled={disabled}
          title="Emoji"
        >
          <Smile size={18} />
        </ToolbarButton>
        {showEmoji && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmoji(false)}
          />
        )}
      </div>
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowColorPicker((prev) => !prev)}
          disabled={disabled}
          title="Text Color"
        >
          <Palette size={18} />
        </ToolbarButton>
        {showColorPicker && (
          <ColorPicker editor={editor} onClose={() => setShowColorPicker(false)} />
        )}
      </div>

      <Divider />

      {/* Group 8 - Undo/Redo */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={disabled}
        title="Undo"
      >
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={disabled}
        title="Redo"
      >
        <Redo size={18} />
      </ToolbarButton>

      {dialog && (
        <InputDialog config={dialog} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
