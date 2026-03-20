"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function SignupButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    setLoading(true)

    try {
      const res = await fetch("/api/affiliate/signup", {
        method: "POST",
      })

      if (res.status === 401) {
        router.push("/login")
        return
      }

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? "Failed to join affiliate program")
        return
      }

      router.refresh()
    } catch {
      alert("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignup}
      disabled={loading}
      className="flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Setting up..." : "Become an Affiliate"}
    </button>
  )
}
