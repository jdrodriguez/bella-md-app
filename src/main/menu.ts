import { Menu, BrowserWindow, MenuItemConstructorOptions, app } from 'electron'

export interface SpellcheckConfig {
  availableLanguages: string[]
  currentLanguage: string
  onLanguageChange: (lang: string) => void
}

const LANGUAGE_LABELS: Record<string, string> = {
  'af': 'Afrikaans', 'bg': 'Bulgarian', 'ca': 'Catalan', 'cs': 'Czech',
  'cy': 'Welsh', 'da': 'Danish', 'de': 'German', 'de-DE': 'German (Germany)',
  'el': 'Greek', 'en-AU': 'English (Australia)', 'en-CA': 'English (Canada)',
  'en-GB': 'English (UK)', 'en-US': 'English (US)', 'es': 'Spanish',
  'es-419': 'Spanish (Latin America)', 'es-AR': 'Spanish (Argentina)',
  'es-ES': 'Spanish (Spain)', 'es-MX': 'Spanish (Mexico)', 'es-US': 'Spanish (US)',
  'et': 'Estonian', 'fa': 'Persian', 'fi': 'Finnish', 'fo': 'Faroese',
  'fr': 'French', 'fr-FR': 'French (France)', 'he': 'Hebrew', 'hi': 'Hindi',
  'hr': 'Croatian', 'hu': 'Hungarian', 'hy': 'Armenian', 'id': 'Indonesian',
  'it': 'Italian', 'it-IT': 'Italian (Italy)', 'ko': 'Korean', 'lt': 'Lithuanian',
  'lv': 'Latvian', 'nb': 'Norwegian', 'nl': 'Dutch', 'pl': 'Polish',
  'pt': 'Portuguese', 'pt-BR': 'Portuguese (Brazil)', 'pt-PT': 'Portuguese (Portugal)',
  'ro': 'Romanian', 'ru': 'Russian', 'sh': 'Serbo-Croatian', 'sk': 'Slovak',
  'sl': 'Slovenian', 'sq': 'Albanian', 'sr': 'Serbian', 'sv': 'Swedish',
  'ta': 'Tamil', 'tg': 'Tajik', 'tr': 'Turkish', 'uk': 'Ukrainian', 'vi': 'Vietnamese'
}

function langLabel(code: string): string {
  return LANGUAGE_LABELS[code] || code
}

function sendMenuAction(mainWindow: BrowserWindow, action: string): void {
  mainWindow.webContents.send('menu-action', action)
}

export function setupMenu(mainWindow: BrowserWindow, spellcheck?: SpellcheckConfig): void {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              {
                label: 'Preferences...',
                accelerator: 'Cmd+,',
                click: (): void => sendMenuAction(mainWindow, 'preferences')
              },
              { type: 'separator' as const },
              {
                label: 'Deactivate License...',
                click: (): void => sendMenuAction(mainWindow, 'deactivate-license')
              },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          } as MenuItemConstructorOptions
        ]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          accelerator: 'CmdOrCtrl+N',
          click: (): void => sendMenuAction(mainWindow, 'new-file')
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: (): void => sendMenuAction(mainWindow, 'open-file')
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: (): void => sendMenuAction(mainWindow, 'open-folder')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: (): void => sendMenuAction(mainWindow, 'save')
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (): void => sendMenuAction(mainWindow, 'save-as')
        },
        { type: 'separator' },
        {
          label: 'Export as PDF',
          click: (): void => sendMenuAction(mainWindow, 'export-pdf')
        },
        {
          label: 'Export as HTML',
          click: (): void => sendMenuAction(mainWindow, 'export-html')
        },
        {
          label: 'Export as Word (.docx)',
          click: (): void => sendMenuAction(mainWindow, 'export-docx')
        },
        { type: 'separator' },
        {
          label: 'Recent Files',
          submenu: []
        }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: (): void => sendMenuAction(mainWindow, 'toggle-find')
        },
        ...(spellcheck
          ? [
              { type: 'separator' as const },
              {
                label: 'Spelling Language',
                submenu: spellcheck.availableLanguages
                  .slice()
                  .sort((a, b) => langLabel(a).localeCompare(langLabel(b)))
                  .map((lang) => ({
                    label: langLabel(lang),
                    type: 'radio' as const,
                    checked: lang === spellcheck.currentLanguage,
                    click: (): void => spellcheck.onLanguageChange(lang)
                  }))
              } as MenuItemConstructorOptions
            ]
          : [])
      ]
    },

    // Format menu
    {
      label: 'Format',
      submenu: [
        {
          label: 'Bold',
          accelerator: 'CmdOrCtrl+B',
          click: (): void => sendMenuAction(mainWindow, 'format-bold')
        },
        {
          label: 'Italic',
          accelerator: 'CmdOrCtrl+I',
          click: (): void => sendMenuAction(mainWindow, 'format-italic')
        },
        {
          label: 'Underline',
          accelerator: 'CmdOrCtrl+U',
          click: (): void => sendMenuAction(mainWindow, 'format-underline')
        },
        { type: 'separator' },
        {
          label: 'Heading 1',
          click: (): void => sendMenuAction(mainWindow, 'format-h1')
        },
        {
          label: 'Heading 2',
          click: (): void => sendMenuAction(mainWindow, 'format-h2')
        },
        {
          label: 'Heading 3',
          click: (): void => sendMenuAction(mainWindow, 'format-h3')
        },
        { type: 'separator' },
        {
          label: 'Bullet List',
          click: (): void => sendMenuAction(mainWindow, 'format-bullet-list')
        },
        {
          label: 'Ordered List',
          click: (): void => sendMenuAction(mainWindow, 'format-ordered-list')
        },
        {
          label: 'Task List',
          click: (): void => sendMenuAction(mainWindow, 'format-task-list')
        },
        { type: 'separator' },
        {
          label: 'Blockquote',
          click: (): void => sendMenuAction(mainWindow, 'format-blockquote')
        },
        {
          label: 'Code Block',
          click: (): void => sendMenuAction(mainWindow, 'format-code-block')
        },
        {
          label: 'Horizontal Rule',
          click: (): void => sendMenuAction(mainWindow, 'format-horizontal-rule')
        }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+\\',
          click: (): void => sendMenuAction(mainWindow, 'toggle-sidebar')
        },
        {
          label: 'Toggle Dark Mode',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: (): void => sendMenuAction(mainWindow, 'toggle-theme')
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual Size' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' }
      ]
    },

    // Window menu
    {
      label: 'Window',
      role: 'window',
      submenu: [{ role: 'minimize' }, { role: 'close' }]
    },

    // Help menu (non-macOS gets Deactivate License here)
    ...(!isMac
      ? [
          {
            label: 'Help',
            submenu: [
              {
                label: 'Deactivate License...',
                click: (): void => sendMenuAction(mainWindow, 'deactivate-license')
              }
            ]
          } as MenuItemConstructorOptions
        ]
      : [])
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
