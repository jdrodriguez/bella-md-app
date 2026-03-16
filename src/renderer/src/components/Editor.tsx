import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { getExtensions } from '../lib/extensions'
import Toolbar from './Toolbar'
import FindReplace from './FindReplace'
import BubbleMenuBar from './BubbleMenuBar'
import TableMenu from './TableMenu'
import TableControls from './TableControls'
import TableToolbar from './TableToolbar'
import { useStore } from '../store'

interface EditorProps {
  content: string
  onUpdate: (markdown: string) => void
  onEditorInstance?: (editor: TiptapEditor | null) => void
  className?: string
}

export default function Editor({ content, onUpdate, onEditorInstance, className }: EditorProps) {
  const [showFindReplace, setShowFindReplace] = useState(false)
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: getExtensions(),
    content,
    editorProps: {
      attributes: {
        class: 'prose-editor',
        spellcheck: 'true'
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) return true
            const reader = new FileReader()
            reader.onload = async () => {
              const dataUrl = reader.result as string
              const docPath = useStore.getState().tabs.find(
                (t) => t.id === useStore.getState().activeTabId
              )?.filePath
              const result = await window.api.savePastedImage(dataUrl, docPath ?? undefined)
              if (result) {
                const node = view.state.schema.nodes.image.create({ src: `file://${result.filePath}` })
                view.dispatch(view.state.tr.replaceSelectionWith(node))
              }
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = (event as DragEvent).dataTransfer?.files
        if (!files || files.length === 0) return false
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            const reader = new FileReader()
            reader.onload = async () => {
              const dataUrl = reader.result as string
              const docPath = useStore.getState().tabs.find(
                (t) => t.id === useStore.getState().activeTabId
              )?.filePath
              const result = await window.api.savePastedImage(dataUrl, docPath ?? undefined)
              if (result) {
                const dragEvent = event as DragEvent
                const coordinates = view.posAtCoords({
                  left: dragEvent.clientX,
                  top: dragEvent.clientY
                })
                if (coordinates) {
                  const node = view.state.schema.nodes.image.create({ src: `file://${result.filePath}` })
                  const tr = view.state.tr.insert(coordinates.pos, node)
                  view.dispatch(tr)
                }
              }
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      }
    },
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true
      const markdown = ed.storage.markdown.getMarkdown()
      onUpdate(markdown)
    }
  })

  // Expose editor instance to parent
  useEffect(() => {
    onEditorInstance?.(editor ?? null)
    return () => onEditorInstance?.(null)
  }, [editor, onEditorInstance])

  // Sync external content changes into the editor
  useEffect(() => {
    if (!editor) return
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    const currentMarkdown = editor.storage.markdown.getMarkdown()
    if (currentMarkdown !== content) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Listen for menu actions from Electron
  const handleMenuAction = useCallback(
    (action: string) => {
      if (!editor) return

      switch (action) {
        case 'format-bold':
          editor.chain().focus().toggleBold().run()
          break
        case 'format-italic':
          editor.chain().focus().toggleItalic().run()
          break
        case 'format-underline':
          editor.chain().focus().toggleUnderline().run()
          break
        case 'format-h1':
          editor.chain().focus().toggleHeading({ level: 1 }).run()
          break
        case 'format-h2':
          editor.chain().focus().toggleHeading({ level: 2 }).run()
          break
        case 'format-h3':
          editor.chain().focus().toggleHeading({ level: 3 }).run()
          break
        case 'format-bullet-list':
          editor.chain().focus().toggleBulletList().run()
          break
        case 'format-ordered-list':
          editor.chain().focus().toggleOrderedList().run()
          break
        case 'format-task-list':
          editor.chain().focus().toggleTaskList().run()
          break
        case 'format-blockquote':
          editor.chain().focus().toggleBlockquote().run()
          break
        case 'format-code-block':
          editor.chain().focus().toggleCodeBlock().run()
          break
        case 'format-horizontal-rule':
          editor.chain().focus().setHorizontalRule().run()
          break
        case 'toggle-find':
          setShowFindReplace((prev) => !prev)
          break
      }
    },
    [editor]
  )

  useEffect(() => {
    const cleanup = window.api.onMenuAction(handleMenuAction)
    return cleanup
  }, [handleMenuAction])

  return (
    <div className="flex flex-col h-full">
      <Toolbar editor={editor} />
      <TableToolbar editor={editor} />
      {showFindReplace && (
        <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className={className} />
        <BubbleMenuBar editor={editor} />
        <TableMenu editor={editor} />
        <TableControls editor={editor} />
      </div>
    </div>
  )
}
