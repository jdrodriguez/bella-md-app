import { useState, useEffect, useCallback, type ReactNode, type FormEvent } from 'react'

type GateState = 'checking' | 'unlicensed' | 'licensed' | 'expired' | 'grace'

interface LicenseGateProps {
  children: ReactNode
}

/**
 * Format a raw license key string into BLMD-XXXX-XXXX-XXXX-XXXX format.
 * Strips non-alphanumeric chars, uppercases, and inserts dashes every 4 chars.
 */
function formatLicenseKey(raw: string): string {
  const stripped = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const chunks: string[] = []
  for (let i = 0; i < stripped.length && chunks.length < 5; i += 4) {
    chunks.push(stripped.slice(i, i + 4))
  }
  return chunks.join('-')
}

export default function LicenseGate({ children }: LicenseGateProps) {
  const [state, setState] = useState<GateState>('checking')
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)
  const [graceDays, setGraceDays] = useState<number | null>(null)

  // Validate stored license on mount
  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const result = await window.api.validateLicense()
        if (cancelled) return

        if (result.valid) {
          if (result.reason === 'grace') {
            setGraceDays(result.daysRemaining ?? null)
            setState('grace')
          } else {
            setState('licensed')
          }
        } else {
          switch (result.reason) {
            case 'expired':
              setState('expired')
              break
            case 'no-token':
            case 'grace-expired':
            default:
              setState('unlicensed')
              break
          }
        }
      } catch {
        // If validation fails entirely, treat as unlicensed
        if (!cancelled) setState('unlicensed')
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  const handleKeyChange = useCallback((value: string) => {
    setLicenseKey(formatLicenseKey(value))
    setError(null)
  }, [])

  const handleActivate = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      const stripped = licenseKey.replace(/[^a-zA-Z0-9]/g, '')
      if (stripped.length < 16) {
        setError('Please enter a complete license key.')
        return
      }

      setActivating(true)
      setError(null)

      try {
        const result = await window.api.activateLicense(licenseKey)
        if (result.success) {
          setState('licensed')
        } else {
          setError(result.error ?? 'Activation failed. Please check your key and try again.')
        }
      } catch {
        setError('Could not reach the license server. Please check your connection.')
      } finally {
        setActivating(false)
      }
    },
    [licenseKey]
  )

  // --- Checking state ---
  if (state === 'checking') {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <div className="h-8 drag-region" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Verifying license...</p>
          </div>
        </div>
      </div>
    )
  }

  // --- Licensed state ---
  if (state === 'licensed') {
    return <>{children}</>
  }

  // --- Grace period state ---
  if (state === 'grace') {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 text-center drag-region">
          <span className="text-xs text-amber-700 dark:text-amber-300 no-drag">
            Offline mode &mdash; connect to verify your license
            {graceDays != null ? ` within ${graceDays} day${graceDays !== 1 ? 's' : ''}` : ''}
          </span>
        </div>
        {children}
      </div>
    )
  }

  // --- Unlicensed / Expired state (activation form) ---
  const isExpired = state === 'expired'

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="h-8 drag-region" />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo / App name */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              BellaMD
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isExpired
                ? 'Your license has expired. Please renew or enter a new key.'
                : 'Enter your license key to get started.'}
            </p>
          </div>

          {/* Activation form */}
          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label
                htmlFor="license-key"
                className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5"
              >
                License Key
              </label>
              <input
                id="license-key"
                type="text"
                value={licenseKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="BLMD-XXXX-XXXX-XXXX-XXXX"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="w-full font-mono text-lg px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={activating}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {activating && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {activating ? 'Activating...' : 'Activate'}
            </button>
          </form>

          {/* Purchase link */}
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            Don&apos;t have a license?{' '}
            <a
              href="https://bellamarkdown.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2"
            >
              Visit bellamarkdown.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
