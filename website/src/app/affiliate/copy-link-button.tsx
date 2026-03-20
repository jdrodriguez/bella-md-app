"use client"

import { useState } from "react"

export function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const url = `https://bellamarkdown.com/?ref=${code}`

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm text-foreground">
        {url}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Copy referral link"
      >
        {copied ? (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Copied!
          </span>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
