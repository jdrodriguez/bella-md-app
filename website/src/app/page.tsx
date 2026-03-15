import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const features = [
  {
    title: "WYSIWYG Editing",
    description:
      "Write in a rich editor that renders Markdown as you type. No split panes, no preview toggle.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
  },
  {
    title: "Dark Mode",
    description:
      "A carefully tuned dark theme that is easy on the eyes during late-night writing sessions.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
    ),
  },
  {
    title: "Multi-Tab Documents",
    description:
      "Work on multiple files at once. Switch between documents with tabs, just like your browser.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"
        />
      </svg>
    ),
  },
  {
    title: "Find & Replace",
    description:
      "Quickly locate and replace text across your document with a fast, keyboard-driven search.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    ),
  },
  {
    title: "PDF & HTML Export",
    description:
      "Export your documents to PDF or HTML with a single click. Share your writing anywhere.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
  {
    title: "Syntax Highlighting",
    description:
      "Fenced code blocks are highlighted automatically. Supports dozens of languages out of the box.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Markdown editing,
              <br />
              beautifully simple.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              A distraction-free WYSIWYG editor that gets out of your way.
              Write, format, and export — all from a clean, native desktop app.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/pricing"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 sm:w-auto"
              >
                Start writing
              </Link>
              <Link
                href="#features"
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
              >
                See features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for writers who want a fast, focused Markdown editor without
              the complexity.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-background p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <div className="mt-8">
              <span className="text-5xl font-bold tracking-tight text-foreground">
                $25
              </span>
              <span className="ml-1 text-lg text-muted-foreground">/year</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Full access to BellaMD on all your devices.
              <br />
              14-day money-back guarantee.
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent/90"
            >
              Start writing
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-8">
              {/* macOS */}
              <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              {/* Windows */}
              <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12V6.75l8-1.25V12H3zm0 .5h8v6.5l-8-1.25V12.5zM11.5 12V5.35l9.5-1.6V12H11.5zm0 .5H21v7.75l-9.5-1.6V12.5z" />
              </svg>
              {/* Linux */}
              <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.368 1.884 1.43.199.021.4-.026.532-.135.27.214.738.174.948-.145.09-.134.107-.324.04-.56.204.02.407.135.55.202.535.267.79.135 1.056-.135.082-.082.12-.267.106-.4 0-.2-.039-.4-.106-.535-.234-.468-.468-.4-.87-.534-.264-.083-.468-.135-.56-.337-.092-.2-.107-.467-.107-.535 0-.135-.043-.2-.086-.268-.121-.131-.406-.2-.6-.382a3.98 3.98 0 01-.58-.724c-.2-.338-.4-.6-.581-.936-.09-.162-.185-.337-.285-.468l-.073-.073c-.04-.068-.117-.135-.189-.2l.003-.003c.113-.29.06-.58-.05-.927a5.08 5.08 0 00-.335-.737c-.168-.267-.287-.4-.308-.467-.025-.075-.036-.137-.04-.322 0-.19.01-.393.014-.598.003-.199 0-.398.007-.534.013-.177.04-.337.067-.467.066-.334.137-.6.137-.867a2.13 2.13 0 00-.063-.46c.29-.067.49-.258.572-.499.202-.6-.16-1.447-.16-1.447-.037-.078-.29-.4-.576-.6-.137-.1-.298-.116-.44-.2-.13-.08-.256-.176-.382-.242-.125-.065-.267-.116-.398-.182l-.073-.04c.34-.44.562-1.06.562-1.777 0-1.421-1.327-3.093-2.96-3.093z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Available on macOS, Windows, and Linux
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
