import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const platforms = [
  {
    name: "macOS",
    href: "https://github.com/jdrodriguez/bella-md-app/releases/download/v1.0.0/bella-md-1.0.0.dmg",
    requirements: "macOS 12 Monterey or later",
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
    href: "https://github.com/jdrodriguez/bella-md-app/releases/download/v1.0.0/bella-md-1.0.0-setup.exe",
    requirements: "Windows 10 or later (64-bit)",
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
    href: "https://github.com/jdrodriguez/bella-md-app/releases/download/v1.0.0/bella-md-1.0.0-arm64.AppImage",
    requirements: "Ubuntu 20.04+, Fedora 36+, or equivalent (AppImage)",
    comingSoon: false,
    icon: (
      <svg
        className="h-10 w-10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.368 1.884 1.43.868.074 1.741-.136 2.804-.09.987.06 1.838-.468 2.288-1.065.287-.36.502-.793.541-1.135.04-.339-.108-.671-.356-.867-.246-.203-.568-.274-.886-.333-.318-.065-.644-.131-.91-.273-.267-.142-.499-.345-.635-.628-.136-.283-.175-.628-.088-.868.029-.065.027-.137.013-.198-.014-.57-.264-.974-.55-1.266-.114-.116-.263-.206-.388-.346a9.551 9.551 0 01-.107-.134c-.085-.116-.186-.282-.235-.573-.082-.456.086-1.166.036-1.833-.05-.673-.263-1.363-.744-1.859-.127-.131-.263-.248-.392-.373-.121-.126-.249-.26-.347-.41-.2-.3-.36-.655-.475-1.073-.112-.417-.18-.885-.187-1.47 0-.089.002-.142.003-.236.004-.093.01-.218.012-.347.022-.772-.064-1.551-.33-2.306-.266-.756-.659-1.467-1.284-1.995C14.783.753 13.684.25 12.504 0z" />
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
                <a
                  href={platform.href}
                  className="mt-6 flex min-h-[44px] w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Download
                </a>
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
