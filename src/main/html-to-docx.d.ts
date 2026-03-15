declare module 'html-to-docx' {
  interface DocxOptions {
    table?: { row?: { cantSplit?: boolean } }
    footer?: boolean
    pageNumber?: boolean
    font?: string
    fontSize?: number
    margins?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
  }

  export default function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString: string | null,
    documentOptions?: DocxOptions
  ): Promise<Buffer>
}
