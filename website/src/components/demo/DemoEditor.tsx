"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import {
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  FileText,
  X,
} from "lucide-react"
import "./editor.css"
import { getExtensions } from "./extensions"
import DemoToolbar from "./DemoToolbar"
import { demoDocuments } from "./demo-content"

export default function DemoEditor() {
  const [activeDocId, setActiveDocId] = useState(demoDocuments[0].id)
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Store document contents so edits persist across tab switches
  const docContents = useRef<Record<string, string>>(
    Object.fromEntries(demoDocuments.map((d) => [d.id, d.content]))
  )

  const activeDoc = demoDocuments.find((d) => d.id === activeDocId)!

  const editor = useEditor({
    extensions: getExtensions(),
    content: activeDoc.content,
    editorProps: {
      attributes: {
        class: "prose-editor",
      },
    },
  })

  // Switch documents: save current, load new
  const switchDocument = useCallback(
    (docId: string) => {
      if (!editor || docId === activeDocId) return

      // Save current editor content as markdown
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      docContents.current[activeDocId] = (editor.storage as any).markdown.getMarkdown()

      // Load the new document
      const newContent = docContents.current[docId]
      editor.commands.setContent(newContent)

      setActiveDocId(docId)
    },
    [editor, activeDocId]
  )

  // Compute word and character counts
  const charCount = editor?.storage.characterCount?.characters() ?? 0
  const wordCount = editor?.storage.characterCount?.words() ?? 0

  // Get cursor position
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })

  useEffect(() => {
    if (!editor) return

    const updateCursor = () => {
      const { from } = editor.state.selection
      const resolved = editor.state.doc.resolve(from)
      // Count block-level nodes before the cursor as a rough "line" number
      let line = 1
      editor.state.doc.nodesBetween(0, from, (node, pos) => {
        if (node.isBlock && pos < from) line++
      })
      const lineStart = resolved.start(resolved.depth)
      const col = from - lineStart + 1
      setCursorPos({ line: Math.max(1, line - 1), col: Math.max(1, col) })
    }

    editor.on("selectionUpdate", updateCursor)
    editor.on("update", updateCursor)

    return () => {
      editor.off("selectionUpdate", updateCursor)
      editor.off("update", updateCursor)
    }
  }, [editor])

  return (
    <div
      className={`${darkMode ? "demo-dark" : ""} rounded-xl border overflow-hidden shadow-2xl`}
      style={{
        height: 720,
        borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb",
      }}
    >
      {/* ── Window chrome ── */}
      <div
        className="flex items-center px-4 py-2.5 shrink-0"
        style={{
          background: darkMode ? "#1a1a2e" : "#e8e8ec",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span
          className="flex-1 text-center text-xs font-medium select-none"
          style={{ color: darkMode ? "#6b7280" : "#6b7280" }}
        >
          BellaMD &mdash; {activeDoc.title}
        </span>
        {/* Balance the traffic lights on the right */}
        <div className="w-[52px]" />
      </div>

      {/* ── Toolbar ── */}
      <div
        className="shrink-0 border-b"
        style={{
          borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          background: darkMode ? "#0f0f1a" : "#ffffff",
        }}
      >
        <DemoToolbar editor={editor} />
      </div>

      {/* ── Main body: sidebar + editor + tabs ── */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100% - 102px)" }}
      >
        {/* Sidebar */}
        <div
          className={`shrink-0 border-r overflow-y-auto transition-all duration-200 ${
            sidebarOpen ? "w-[180px]" : "w-0 border-r-0"
          } hidden md:block`}
          style={{
            background: darkMode ? "#111827" : "#f9fafb",
            borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          }}
        >
          {sidebarOpen && (
            <div className="px-2 py-3">
              <div
                className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}
              >
                Files
              </div>
              {demoDocuments.map((doc) => {
                const isActive = doc.id === activeDocId
                return (
                  <button
                    key={doc.id}
                    onClick={() => switchDocument(doc.id)}
                    className={`w-full text-left rounded-md px-2 py-1.5 text-xs font-medium flex items-center gap-2 transition-colors ${
                      isActive ? "font-semibold" : ""
                    }`}
                    style={{
                      background: isActive
                        ? darkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(99,102,241,0.08)"
                        : "transparent",
                      color: isActive
                        ? darkMode
                          ? "#f3f4f6"
                          : "#1f2937"
                        : darkMode
                          ? "#9ca3af"
                          : "#6b7280",
                    }}
                  >
                    <FileText
                      size={14}
                      style={{
                        opacity: isActive ? 1 : 0.5,
                        flexShrink: 0,
                      }}
                    />
                    {doc.title}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Editor area */}
        <div
          className="flex-1 overflow-y-auto demo-editor-scroll"
          style={{
            background: darkMode ? "#030712" : "#ffffff",
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* Tab panel (right side) */}
        <div
          className="shrink-0 w-[160px] border-l overflow-y-auto hidden md:block"
          style={{
            background: darkMode ? "#111827" : "#f3f4f6",
            borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          }}
        >
          <div className="py-1">
            {demoDocuments.map((doc) => {
              const isActive = doc.id === activeDocId
              return (
                <button
                  key={doc.id}
                  onClick={() => switchDocument(doc.id)}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-1 transition-colors group"
                  style={{
                    background: isActive
                      ? darkMode
                        ? "#030712"
                        : "#ffffff"
                      : "transparent",
                    color: isActive
                      ? darkMode
                        ? "#f3f4f6"
                        : "#1f2937"
                      : darkMode
                        ? "#6b7280"
                        : "#9ca3af",
                    borderLeft: isActive
                      ? `2px solid ${darkMode ? "#38bcd8" : "#0ea5c2"}`
                      : "2px solid transparent",
                  }}
                >
                  <span className="truncate">{doc.title}</span>
                  <X
                    size={12}
                    className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div
        className="flex items-center justify-between px-4 py-1.5 text-[11px] shrink-0 border-t select-none"
        style={{
          background: darkMode ? "#111827" : "#f9fafb",
          borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          color: darkMode ? "#6b7280" : "#9ca3af",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden md:flex items-center justify-center rounded p-0.5 transition-colors hover:bg-black/5"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            style={{
              color: darkMode ? "#9ca3af" : "#6b7280",
            }}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={14} />
            ) : (
              <PanelLeft size={14} />
            )}
          </button>

          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span>&middot;</span>
          <span>
            {charCount} {charCount === 1 ? "char" : "chars"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>Markdown</span>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="flex items-center justify-center rounded p-0.5 transition-colors hover:bg-black/5"
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              color: darkMode ? "#fbbf24" : "#6b7280",
            }}
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
