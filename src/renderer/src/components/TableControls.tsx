import { useEffect, useState, useCallback, useRef } from 'react'
import type { Editor } from '@tiptap/react'
import { Plus } from 'lucide-react'

interface Props {
  editor: Editor | null
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export default function TableControls({ editor }: Props) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [clipRect, setClipRect] = useState<Rect | null>(null)
  const rafRef = useRef(0)
  const tableElRef = useRef<HTMLElement | null>(null)

  const update = useCallback(() => {
    if (!editor || !editor.isActive('table')) {
      setRect(null)
      return
    }

    const { $anchor } = editor.state.selection
    let depth = $anchor.depth
    while (depth > 0 && $anchor.node(depth).type.name !== 'table') {
      depth--
    }
    if (depth === 0) {
      setRect(null)
      return
    }

    const dom = editor.view.nodeDOM($anchor.before(depth))
    if (!(dom instanceof HTMLElement)) {
      setRect(null)
      return
    }

    const tableEl = dom.tagName === 'TABLE' ? dom : dom.querySelector('table')
    if (!tableEl) {
      setRect(null)
      return
    }

    tableElRef.current = tableEl
    const r = tableEl.getBoundingClientRect()
    setRect({ left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height })

    const container = tableEl.closest('.overflow-y-auto')
    if (container) {
      const cr = container.getBoundingClientRect()
      setClipRect({ left: cr.left, top: cr.top, right: cr.right, bottom: cr.bottom, width: cr.width, height: cr.height })
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return

    const handler = (): void => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }

    editor.on('selectionUpdate', handler)
    editor.on('transaction', handler)

    const dom = editor.view.dom
    const scrollEl = dom.closest('.overflow-y-auto')
    scrollEl?.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler, { passive: true })

    return () => {
      editor.off('selectionUpdate', handler)
      editor.off('transaction', handler)
      scrollEl?.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
      cancelAnimationFrame(rafRef.current)
    }
  }, [editor, update])

  if (!editor || !rect) return null

  // Hide buttons if they'd overflow the scroll container
  const showBottom = !clipRect || rect.bottom + 32 < clipRect.bottom
  const showRight = !clipRect || rect.right + 32 < clipRect.right

  const btnClass =
    'fixed z-40 flex items-center justify-center w-6 h-6 rounded-full ' +
    'border border-gray-300 dark:border-gray-600 ' +
    'bg-white dark:bg-gray-800 ' +
    'text-gray-400 dark:text-gray-500 ' +
    'hover:text-blue-500 hover:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400 ' +
    'shadow-sm hover:shadow transition-all cursor-pointer'

  return (
    <>
      {showBottom && (
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().addRowAfter().run()
          }}
          className={btnClass}
          style={{
            left: rect.left + rect.width / 2 - 12,
            top: rect.bottom + 4
          }}
          title="Add row"
        >
          <Plus size={14} />
        </button>
      )}
      {showRight && (
        <button
          onMouseDown={(e) => {
            e.preventDefault()
            editor.chain().focus().addColumnAfter().run()
          }}
          className={btnClass}
          style={{
            left: rect.right + 4,
            top: rect.top + rect.height / 2 - 12
          }}
          title="Add column"
        >
          <Plus size={14} />
        </button>
      )}
    </>
  )
}
