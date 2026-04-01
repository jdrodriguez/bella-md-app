import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FaApple, FaWindows, FaLinux } from "react-icons/fa";

const RELEASE_BASE = "https://github.com/jdrodriguez/bella-md-app/releases/download/v1.0.1"

const platforms = [
  {
    name: "macOS",
    href: `${RELEASE_BASE}/bella-md-1.0.1.dmg`,
    requirements: "macOS 12 Monterey or later (Apple Silicon)",
    comingSoon: false,
    icon: <FaApple className="h-10 w-10" />,
  },
  {
    name: "Windows",
    href: `${RELEASE_BASE}/bella-md-1.0.1-setup.exe`,
    requirements: "Windows 10 or later",
    note: 'Windows may show a "Windows protected your PC" warning. Click "More info" then "Run anyway" to install.',
    comingSoon: false,
    icon: <FaWindows className="h-10 w-10" />,
  },
  {
    name: "Linux",
    href: `${RELEASE_BASE}/bella-md-1.0.1-x86_64.AppImage`,
    altHref: `${RELEASE_BASE}/bella-md-1.0.1-arm64.AppImage`,
    altLabel: "ARM64",
    requirements: "Ubuntu 20.04+, Fedora 36+, or equivalent (AppImage)",
    comingSoon: false,
    icon: <FaLinux className="h-10 w-10" />,
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
