"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeactivateButton({
  licenseKey,
  machineId,
}: {
  licenseKey: string
  machineId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this device? You can reactivate it later by entering your license key in BellaMD.",
    )
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await fetch("/api/license/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey, machineId }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? "Failed to deactivate device")
        return
      }

      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDeactivate}
      disabled={loading}
      className="min-h-[44px] rounded-md px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
    >
      {loading ? "Removing..." : "Deactivate"}
    </button>
  )
}
