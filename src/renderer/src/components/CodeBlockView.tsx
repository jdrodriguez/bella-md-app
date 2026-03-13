import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import type { createLowlight } from 'lowlight'

const LANGUAGES = [
  { value: '', label: 'Auto' },
  { value: 'bash', label: 'Bash' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'diff', label: 'Diff' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lua', label: 'Lua' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'php', label: 'PHP' },
  { value: 'python', label: 'Python' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' }
]

export function CodeBlockComponent({ node, updateAttributes }: NodeViewProps) {
  const language = (node.attrs.language as string) || ''

  return (
    <NodeViewWrapper className="relative group code-block-wrapper">
      <select
        aria-label="Select code language"
        value={language}
        onChange={(e) => updateAttributes({ language: e.target.value })}
        contentEditable={false}
        className="absolute top-2 right-2 z-10 text-xs bg-gray-200 dark:bg-gray-700 border-none rounded px-2 py-0.5 text-gray-600 dark:text-gray-300 cursor-pointer outline-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}

export function createCodeBlockExtension(lowlight: ReturnType<typeof createLowlight>) {
  return CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent)
    }
  }).configure({
    lowlight
  })
}
