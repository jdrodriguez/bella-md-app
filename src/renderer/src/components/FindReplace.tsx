import { useState, useCallback, useRef, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react'

interface FindReplaceProps {
  editor: Editor | null
  onClose: () => void
}

interface MatchPosition {
  from: number
  to: number
}

export default function FindReplace({ editor, onClose }: FindReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matches, setMatches] = useState<MatchPosition[]>([])
  const [currentMatch, setCurrentMatch] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const findMatches = useCallback(
    (term: string): MatchPosition[] => {
      if (!editor || !term) return []

      const results: MatchPosition[] = []
      const doc = editor.state.doc
      const lowerTerm = term.toLowerCase()

      doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const lowerText = node.text.toLowerCase()
          let index = lowerText.indexOf(lowerTerm)
          while (index !== -1) {
            results.push({
              from: pos + index,
              to: pos + index + term.length
            })
            index = lowerText.indexOf(lowerTerm, index + 1)
          }
        }
      })

      return results
    },
    [editor]
  )

  const highlightMatch = useCallback(
    (match: MatchPosition) => {
      if (!editor) return
      editor
        .chain()
        .focus()
        .setTextSelection({ from: match.from, to: match.to })
        .scrollIntoView()
        .run()
    },
    [editor]
  )

  // Update matches when search term changes
  useEffect(() => {
    const foundMatches = findMatches(searchTerm)
    setMatches(foundMatches)
    setCurrentMatch(foundMatches.length > 0 ? 0 : -1)
    if (foundMatches.length > 0) {
      highlightMatch(foundMatches[0])
    }
  }, [searchTerm, findMatches, highlightMatch])

  function findNext() {
    if (matches.length === 0) return
    const next = (currentMatch + 1) % matches.length
    setCurrentMatch(next)
    highlightMatch(matches[next])
  }

  function findPrevious() {
    if (matches.length === 0) return
    const prev = (currentMatch - 1 + matches.length) % matches.length
    setCurrentMatch(prev)
    highlightMatch(matches[prev])
  }

  function replaceCurrent() {
    if (!editor || currentMatch < 0 || matches.length === 0) return

    const match = matches[currentMatch]
    editor
      .chain()
      .focus()
      .setTextSelection({ from: match.from, to: match.to })
      .insertContent(replaceTerm)
      .run()

    // Re-search after replacement
    const updatedMatches = findMatches(searchTerm)
    setMatches(updatedMatches)
    const nextIndex = updatedMatches.length > 0 ? Math.min(currentMatch, updatedMatches.length - 1) : -1
    setCurrentMatch(nextIndex)
    if (nextIndex >= 0) {
      highlightMatch(updatedMatches[nextIndex])
    }
  }

  function replaceAll() {
    if (!editor || matches.length === 0) return

    // Replace from end to start to preserve positions
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from)

    let chain = editor.chain().focus()
    for (const match of sortedMatches) {
      chain = chain
        .setTextSelection({ from: match.from, to: match.to })
        .insertContent(replaceTerm)
    }
    chain.run()

    setMatches([])
    setCurrentMatch(-1)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        findPrevious()
      } else {
        findNext()
      }
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  function handleReplaceKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const matchLabel =
    matches.length > 0
      ? `${currentMatch + 1} of ${matches.length} matches`
      : searchTerm
        ? 'No matches'
        : ''

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-1.5">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Find..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none focus:border-blue-500 w-44"
        />
        <input
          type="text"
          placeholder="Replace..."
          value={replaceTerm}
          onChange={(e) => setReplaceTerm(e.target.value)}
          onKeyDown={handleReplaceKeyDown}
          className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 outline-none focus:border-blue-500 w-44"
        />
      </div>

      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[100px]">{matchLabel}</span>

      <div className="flex items-center gap-0.5">
        <button
          onClick={findPrevious}
          disabled={matches.length === 0}
          title="Find Previous"
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={findNext}
          disabled={matches.length === 0}
          title="Find Next"
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={replaceCurrent}
          disabled={matches.length === 0}
          title="Replace"
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Replace size={16} />
        </button>
        <button
          onClick={replaceAll}
          disabled={matches.length === 0}
          title="Replace All"
          className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ReplaceAll size={16} />
        </button>
      </div>

      <button
        onClick={onClose}
        title="Close"
        className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      >
        <X size={16} />
      </button>
    </div>
  )
}
