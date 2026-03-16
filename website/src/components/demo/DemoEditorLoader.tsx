"use client"

import dynamic from "next/dynamic"

const DemoEditor = dynamic(() => import("./DemoEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-500">Loading editor...</p>
    </div>
  ),
})

export default function DemoEditorLoader() {
  return <DemoEditor />
}
