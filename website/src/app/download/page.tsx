import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const RELEASE_BASE = "https://github.com/jdrodriguez/bella-md-app/releases/download/v1.0.0"

const platforms = [
  {
    name: "macOS",
    href: `${RELEASE_BASE}/bella-md-1.0.0.dmg`,
    requirements: "macOS 12 Monterey or later (Apple Silicon)",
    comingSoon: false,
    icon: (
      <svg
        className="h-10 w-10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    name: "Windows",
    href: `${RELEASE_BASE}/bella-md-1.0.0-x64-setup.exe`,
    altHref: `${RELEASE_BASE}/bella-md-1.0.0-arm64-setup.exe`,
    altLabel: "ARM64",
    requirements: "Windows 10 or later",
    note: 'Windows may show a "Windows protected your PC" warning. Click "More info" then "Run anyway" to install.',
    comingSoon: false,
    icon: (
      <svg
        className="h-10 w-10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .08V5.21L20 3zm-10 9.34l10-.08V21l-10-1.39V12.34zM3 12.5l6 .09v6.72l-6-1.07V12.5z" />
      </svg>
    ),
  },
  {
    name: "Linux",
    href: `${RELEASE_BASE}/bella-md-1.0.0-x86_64.AppImage`,
    altHref: `${RELEASE_BASE}/bella-md-1.0.0-arm64.AppImage`,
    altLabel: "ARM64",
    requirements: "Ubuntu 20.04+, Fedora 36+, or equivalent (AppImage)",
    comingSoon: false,
    icon: (
      <svg
        className="h-10 w-10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.581 19.049c-.55-.446-.336-1.431-.907-1.917.553-3.365-.997-6.331-2.845-8.232-1.551-1.595-1.051-3.147-1.051-4.49 0-2.146-.881-4.41-3.55-4.41-2.853 0-3.635 2.38-3.663 3.738-.068 3.262.659 4.11-1.25 6.484-2.246 2.793-2.577 5.579-2.07 7.057a2.924 2.924 0 01-1.155 1.291c-.283.173-.584.289-.886.398-.522.19-.705.049-.87.233-.12.133-.125.345-.109.518.02.189.105.324.236.396.227.124.463.036.696-.041.207-.069.421-.151.63-.208.254-.069.489-.1.69-.043.264.074.476.311.618.642.197.456.128.906-.025 1.206-.197.383-.505.653-.77.715a4.986 4.986 0 01-.483.084c-.197.025-.393.05-.564.122-.33.139-.406.467-.247.745.198.348.692.49 1.082.373.506-.15 1.1-.528 1.332-1.177.117-.328.122-.662.058-.982.282.293.618.468.934.436.593-.062.753-.664.607-1.318.327.213.769.378 1.105.188.4-.226.37-.797.069-1.263.558.053 1.015-.127 1.107-.547.06-.281-.018-.575-.145-.832.626-.004 1.14-.387 1.14-.976 0-.399-.326-.774-.698-.977-.07-.038-.145-.068-.22-.095.188-.181.345-.381.472-.587l.017.002c.276-.441.353-.951.234-1.424-.038-.148-.1-.288-.172-.42.192.01.378.013.558.004.408-.025.796-.094 1.167-.199.209.203.415.413.54.67.143.296.084.64-.064.926-.168.325-.368.624-.39.984-.026.43.194.765.479.958.29.197.651.295.978.156.327-.139.522-.444.575-.782.052-.333.01-.671-.128-.976-.07-.155-.162-.3-.265-.433.018-.011.034-.024.051-.036.31-.218.567-.489.744-.8.072-.127.129-.259.167-.395.099.036.203.057.31.057.377 0 .723-.198.965-.523.163-.219.261-.473.282-.731l.008-.042c.092-.284.087-.558-.012-.814z" />
      </svg>
    ),
  },
]

export default function DownloadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-24">
        {/* Header */}
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
            Download BellaMD
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Available for macOS, Windows, and Linux.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="mt-16 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className={platform.comingSoon ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}>
                {platform.icon}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {platform.name}
              </h2>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {platform.requirements}
              </p>
              {platform.comingSoon ? (
                <div className="mt-6 flex w-full flex-col items-center gap-2">
                  <span
                    className="flex min-h-[44px] w-full cursor-not-allowed items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                    aria-disabled="true"
                  >
                    Download
                  </span>
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                    Coming soon
                  </span>
                </div>
              ) : (
                <div className="mt-6 flex w-full flex-col items-center gap-2">
                  <a
                    href={platform.href}
                    className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                  >
                    Download{platform.altHref ? " (x64)" : ""}
                  </a>
                  {platform.altHref && (
                    <a
                      href={platform.altHref}
                      className="text-xs font-medium text-accent underline underline-offset-4 hover:opacity-80"
                    >
                      {platform.altLabel} version
                    </a>
                  )}
                  {platform.note && (
                    <p className="mt-2 text-[11px] leading-tight text-zinc-400 dark:text-zinc-500">
                      {platform.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* License Note */}
        <div className="mt-16 w-full max-w-2xl text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You&apos;ll need a license key to activate BellaMD. Don&apos;t have one?{" "}
            <a
              href="/pricing"
              className="font-medium text-accent underline underline-offset-4 hover:opacity-80"
            >
              Get started
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
