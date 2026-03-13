import { useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  editor: Editor | null
  onClose: () => void
}

const COLORS = [
  '#ffffff', '#f8f9fa', '#1e1e1e', '#868e96',
  '#fa5252', '#e64980', '#be4bdb', '#7950f2',
  '#4c6ef5', '#228be6', '#15aabf', '#12b886',
  '#40c057', '#82c91e', '#fab005', '#fd7e14',
  '#f06595', '#cc5de8'
]

export default function ColorPicker({ editor, onClose }: ColorPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  const activeColor = editor?.getAttributes('textStyle').color as string | undefined

  function handleColorSelect(hex: string) {
    if (!editor) return
    editor.chain().focus().setColor(hex).run()
    onClose()
  }

  function handleUnsetColor() {
    if (!editor) return
    editor.chain().focus().unsetColor().run()
    onClose()
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50"
    >
      <button
        onClick={handleUnsetColor}
        className="flex items-center gap-2 w-full px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mb-1"
      >
        <span
          className="w-[24px] h-[24px] rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, #fff 45%, #ff0000 45%, #ff0000 55%, #fff 55%)'
          }}
        />
        Default
      </button>

      <div className="grid grid-cols-6 gap-1">
        {COLORS.map((hex) => {
          const isActive =
            activeColor?.toLowerCase() === hex.toLowerCase()

          return (
            <button
              key={hex}
              onClick={() => handleColorSelect(hex)}
              title={hex}
              className={`w-[24px] h-[24px] rounded cursor-pointer flex items-center justify-center transition-shadow hover:ring-2 hover:ring-blue-400 ${
                isActive
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              style={{ backgroundColor: hex }}
            >
              {isActive && (
                <Check
                  size={14}
                  className={
                    hex === '#ffffff' || hex === '#f8f9fa' || hex === '#fab005' || hex === '#82c91e'
                      ? 'text-gray-800'
                      : 'text-white'
                  }
                  strokeWidth={3}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
