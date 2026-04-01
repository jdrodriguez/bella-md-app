# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BellaMD is a monorepo containing:
1. **Electron desktop app** — A WYSIWYG Markdown document editor built with React 18, Tiptap, and Zustand
2. **Distribution website** (`website/`) — Next.js 16 site at bellamarkdown.com with Stripe subscriptions, license management, and an interactive editor demo
3. **Mobile app** (`mobile/`) — Expo (React Native) app for iOS and Android. Tiptap editor runs in a WebView with a typed postMessage bridge. See `mobile/PLAN.md` for full implementation plan.

## Commands

### Electron App (root)
```bash
npm run dev              # Start Electron Vite dev server
npm run build            # Production build (main + preload + renderer)
npm run type-check       # TypeScript check (runs tsc against both node and web configs)
npm run lint             # Currently a no-op (echo 'lint ok')
npm run package          # Package for current platform via electron-builder
npm run package:win      # Package for Windows
npm run package:linux    # Package for Linux
```

### macOS Notarized Build
```bash
export APPLE_ID="rodriguez.josue.d@gmail.com"
export APPLE_APP_SPECIFIC_PASSWORD="<see memory>"
export APPLE_TEAM_ID="R7JNG8KV57"
npx electron-builder --mac --publish never
```

### Website (website/)
```bash
cd website
npm run dev              # Next.js dev server
npm run build            # Production build
npm run db:push          # Push Drizzle schema to Postgres
npm run db:studio        # Open Drizzle Studio
```

### Mobile App (mobile/)
```bash
cd mobile
npm run prebuild:webview # Build Tiptap WebView bundle via Vite
npm run dev              # Start Expo dev server (prebuild:webview runs first)
npm run build            # EAS Build for production
```

## Architecture

### Electron App — Three-process architecture

```
Main Process (src/main/)        Preload (src/preload/)        Renderer (src/renderer/)
  - Window management             - Context bridge               - React UI
  - File I/O (fs)                 - Typed window.api             - Tiptap editor
  - IPC handlers                  - Event listeners              - Zustand store
  - App menu                                                     - Tailwind CSS
  - PDF/HTML/DOCX export                                         - License gate
  - License management (keytar)
```

- **Main process** (`src/main/index.ts`, `ipc.ts`, `menu.ts`, `license.ts`): Handles file system operations, window lifecycle, directory watching (debounced 500ms), exports, and license activation/validation. Preferences stored as JSON in `app.getPath('userData')/preferences.json`. License tokens stored in OS keychain via `keytar`.
- **Preload** (`src/preload/index.ts`): Exposes a typed `window.api` object via `contextBridge`. The renderer never accesses Node/fs directly. Includes license IPC methods.
- **Renderer** (`src/renderer/src/`): React app with a single Zustand store (`store.ts`). `App.tsx` orchestrates menu actions, file events, and editor sync. `LicenseGate` wraps the app to enforce activation.

### Mobile App — Expo + WebView

```
mobile/
  src/
    app/                        # Expo Router (file-based routing)
      (tabs)/index.tsx          # Document list
      (tabs)/settings.tsx       # Settings
      editor/[id].tsx           # Full-screen editor
      license.tsx               # License activation modal
    components/
      EditorWebView.tsx         # WebView wrapper with postMessage bridge
      MobileToolbar.tsx         # Native toolbar above keyboard
      LicenseGate.tsx           # License check wrapper
    lib/
      bridge.ts                 # Typed postMessage protocol
      license.ts                # License service (expo-secure-store + expo-application)
      storage.ts                # Document CRUD (expo-file-system)
    webview/                    # Vite-bundled Tiptap editor HTML
```

- **Editor approach**: Tiptap runs in a WebView, reusing the browser-compatible extensions from `website/src/components/demo/extensions.ts`
- **Bridge**: Typed JSON messages over `postMessage`/`onMessage` for commands (FORMAT, SET_CONTENT) and events (CONTENT_CHANGED, SELECTION_CHANGED)
- **Licensing**: Calls the same `bellamarkdown.com/api/license/` endpoints. Uses `expo-secure-store` (replaces `keytar`) and `expo-application` (replaces `node-machine-id`)
- **Storage**: Documents as `.md` files in app document directory via `expo-file-system`. Soft deletes to `.trash/`

### Website — Next.js + Postgres + Auth.js

```
website/
  src/
    app/                    # Next.js App Router pages
      api/
        auth/[...nextauth]/ # Auth.js magic link auth
        license/            # Activate, validate, deactivate, heartbeat
        stripe/             # Checkout session + webhook
      account/              # User dashboard + device management
      pricing/              # $25/year plan
      download/             # Platform downloads (macOS, Windows, Linux)
      privacy/              # Privacy policy
      terms/                # Terms of service
    components/
      demo/                 # Interactive Tiptap editor demo (landing page)
      header.tsx            # Shared nav header
      footer.tsx            # Shared footer
    db/
      schema.ts             # Drizzle ORM schema (user, license, activation, order tables)
      index.ts              # Postgres connection
    lib/
      auth.ts               # Auth.js config (Resend magic links)
      stripe.ts             # Stripe client (lazy-init singleton)
      license.ts            # License key generation + helpers
```

**Tech stack:** Next.js 16, Drizzle ORM, Postgres (Railway), Auth.js v5, Stripe, Resend, Tailwind CSS v4

**Deploy:** Railway (Docker container + Postgres addon). Auto-deploys from GitHub on push to main. Root directory set to `website/`.

## Licensing System

- **$25/year** subscription via Stripe Checkout
- **3 devices max** per license key (format: `BLMD-XXXX-XXXX-XXXX-XXXX`)
- **Machine fingerprinting** via `node-machine-id` (desktop) / `expo-application` (mobile)
- **Token storage** in OS keychain via `keytar` (desktop) / `expo-secure-store` (mobile)
- **Heartbeat**: App pings server every 7 days; 30-day offline grace period
- **Activation flow**: User purchases → receives license key via email → enters in app → server validates + returns signed JWT → stored in keychain

## Key Patterns

- **IPC communication**: All file operations flow through `window.api.*` methods defined in the preload script. Never use `require('fs')` or `ipcRenderer` directly in renderer code.
- **State management**: Single Zustand store in `store.ts` manages tabs, sidebar, file tree, theme, and recent files. Theme persisted in localStorage.
- **Editor**: Tiptap with 20+ extensions including `tiptap-markdown` for serialization. Extensions configured in `src/renderer/src/lib/extensions.ts`.
- **Styling**: Tailwind CSS with class-based dark mode. Editor-specific styles in `editor.css`. No CSS-in-JS.
- **Demo editor**: The website landing page has a fully interactive Tiptap editor demo at `website/src/components/demo/`. Uses `demo-dark` class (not `dark`) to avoid conflicts with the website's own dark mode.
- **Auth.js tables**: Must use singular names (`user`, `account`, `session`, `verificationToken`) to match the Drizzle adapter's expectations.
- **Stripe client**: Uses lazy initialization (`getStripe()`) to avoid build-time errors when env vars aren't set.

## TypeScript Configuration

### Electron App
Two separate configs referenced from the root `tsconfig.json`:
- `tsconfig.node.json` — Main + preload processes (ES2022, ESNext modules)
- `tsconfig.web.json` — Renderer process (ES2020, react-jsx, `@renderer` path alias)

### Website
- `website/tsconfig.json` — Standard Next.js config with `@/*` path alias

## Path Aliases

- `@renderer` resolves to `src/renderer/src/` (Electron renderer)
- `@/*` resolves to `website/src/*` (website)
- `@/*` resolves to `mobile/src/*` (mobile — separate tsconfig)

## Component Structure

### Electron Renderer (`src/renderer/src/components/`)
- `Editor` — Tiptap editor wrapper with image paste/drop handling
- `Toolbar` — Rich formatting toolbar (8 button groups)
- `TabBar` — Multi-tab document management
- `Sidebar` — Directory/file tree browser with drag-to-resize
- `FindReplace` — Search and replace in editor
- `StatusBar` — Word/char count, line/col, theme toggle
- `BubbleMenuBar` — Context toolbar on text selection
- `SlashCommandMenu` — "/" block insertion menu
- `TableMenu` — Right-click table operations
- `CodeBlockView` — Custom code block with language selector
- `ColorPicker` — Text color selection
- `EmojiPicker` — Emoji insertion
- `LicenseGate` — License activation screen (wraps entire app)

### Website Demo (`website/src/components/demo/`)
- `DemoEditor` — Full interactive replica of the desktop app
- `DemoToolbar` — Formatting toolbar (subset of desktop toolbar)
- `DemoEditorLoader` — Dynamic import wrapper (no SSR)
- `extensions.ts` — Tiptap extensions config (browser-compatible)
- `editor.css` — Editor styles with `demo-dark` prefix
- `demo-content.ts` — 3 sample markdown documents

## Infrastructure

| Service | Provider | Details |
|---------|----------|---------|
| Website hosting | Railway | Docker container, auto-deploy from GitHub |
| Database | Railway Postgres | `Postgres-Nnl7` addon |
| Payments | Stripe | Live mode, $25/year subscription |
| Email | Resend | Magic link auth via `noreply@bellamarkdown.com` |
| DNS | Hostinger | `bellamarkdown.com` + `www` → Railway |
| Downloads | GitHub Releases | v1.0.0 with macOS/Windows/Linux (x64 + ARM64) |
| Code signing | Apple Developer | Team ID: R7JNG8KV57, notarized via electron-builder |
| Mobile builds | EAS Build | Expo Application Services for iOS + Android |

## Environment Variables

### Railway (website)
- `DATABASE_URL` — Postgres connection (references Postgres-Nnl7 service)
- `AUTH_SECRET` — Auth.js session signing
- `AUTH_RESEND_KEY` — Resend API key for magic links
- `AUTH_URL` — `https://bellamarkdown.com`
- `STRIPE_SECRET_KEY` — Stripe live secret key
- `STRIPE_PUBLISHABLE_KEY` — Stripe live publishable key
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

### Electron App (build-time)
- `APPLE_ID` — Apple developer email
- `APPLE_APP_SPECIFIC_PASSWORD` — For notarization
- `APPLE_TEAM_ID` — `R7JNG8KV57`
