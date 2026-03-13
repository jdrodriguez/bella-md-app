# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BellaMD is an Electron desktop application — a WYSIWYG Markdown document editor built with React 18, Tiptap, and Zustand. There is no backend, no database, and no authentication. All file operations go through Electron IPC.

## Commands

```bash
npm run dev              # Start Electron Vite dev server
npm run build            # Production build
npm run type-check       # TypeScript check (runs tsc against both node and web configs)
npm run lint             # Currently a no-op (echo 'lint ok')
npm run package          # Package for current platform via electron-builder
npm run package:win      # Package for Windows
npm run package:linux    # Package for Linux
```

## Architecture

**Three-process Electron architecture:**

```
Main Process (src/main/)        Preload (src/preload/)        Renderer (src/renderer/)
  - Window management             - Context bridge               - React UI
  - File I/O (fs)                 - Typed window.api             - Tiptap editor
  - IPC handlers                  - Event listeners              - Zustand store
  - App menu                                                     - Tailwind CSS
  - PDF/HTML export
```

- **Main process** (`src/main/index.ts`, `ipc.ts`, `menu.ts`): Handles all file system operations, window lifecycle, directory watching (debounced 500ms), and exports. Preferences stored as JSON in `app.getPath('userData')/preferences.json`.
- **Preload** (`src/preload/index.ts`): Exposes a typed `window.api` object via `contextBridge`. The renderer never accesses Node/fs directly.
- **Renderer** (`src/renderer/src/`): React app with a single Zustand store (`store.ts`). `App.tsx` orchestrates menu actions, file events, and editor sync.

## Key Patterns

- **IPC communication**: All file operations flow through `window.api.*` methods defined in the preload script. Never use `require('fs')` or `ipcRenderer` directly in renderer code.
- **State management**: Single Zustand store in `store.ts` manages tabs, sidebar, file tree, theme, and recent files. Theme is also persisted in localStorage.
- **Editor**: Tiptap with `tiptap-markdown` extension for markdown serialization. Extensions configured in `src/renderer/src/lib/extensions.ts`.
- **Styling**: Tailwind CSS with class-based dark mode. Editor-specific styles in `editor.css`. No CSS-in-JS.

## TypeScript Configuration

Two separate configs referenced from the root `tsconfig.json`:
- `tsconfig.node.json` — Main + preload processes (ES2022, ESNext modules)
- `tsconfig.web.json` — Renderer process (ES2020, react-jsx, `@renderer` path alias)

## Path Aliases

- `@renderer` resolves to `src/renderer/src/` (configured in both `tsconfig.web.json` and `electron.vite.config.ts`)

## Component Structure

Key renderer components in `src/renderer/src/components/`:
- `Editor` — Tiptap editor wrapper
- `Toolbar` — Rich formatting toolbar
- `TabBar` — Multi-tab document management
- `Sidebar` — Directory/file tree browser
- `FindReplace` — Search and replace in editor
- `StatusBar` — Character count and file info
- `EmojiPicker` — Emoji insertion
