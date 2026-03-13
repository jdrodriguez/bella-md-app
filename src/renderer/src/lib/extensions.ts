import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { createCodeBlockExtension } from '../components/CodeBlockView'
import Dropcursor from '@tiptap/extension-dropcursor'
import { Markdown } from 'tiptap-markdown'
import { common, createLowlight } from 'lowlight'

export function getExtensions() {
  const lowlight = createLowlight(common)

  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      },
      codeBlock: false
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link'
      }
    }),
    Underline,
    Highlight.configure({
      multicolor: false
    }),
    Typography,
    Superscript,
    Subscript,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    Table.configure({
      resizable: false
    }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({
      nested: true
    }),
    Placeholder.configure({
      placeholder: 'Start writing...'
    }),
    CharacterCount,
    Color,
    TextStyle,
    FontFamily,
    createCodeBlockExtension(lowlight),
    Dropcursor.configure({
      color: '#ccc',
      width: 2
    }),
    Markdown.configure({
      html: true,
      transformCopiedText: false,
      transformPastedText: true
    })
  ]
}
