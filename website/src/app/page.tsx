import Link from "next/link";
import Image from "next/image";
import { FaApple, FaWindows, FaLinux } from "react-icons/fa";
import DemoEditorLoader from "@/components/demo/DemoEditorLoader";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const features = [
  {
    title: "WYSIWYG Editing",
    description:
      "Write in a rich editor that renders Markdown as you type.",
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
      "A carefully tuned dark theme for late-night writing sessions.",
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
      "Work on multiple files at once with a familiar tabbed interface.",
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
      "Locate and replace text with a fast, keyboard-driven search.",
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
    title: "PDF, HTML & Word Export",
    description:
      "Export your documents to PDF, HTML, or Word (.docx) with a single click.",
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
      "Fenced code blocks highlighted for dozens of languages.",
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

      {/* Hero — interactive demo */}
      <section className="relative w-full px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />

        <div className="relative mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Markdown editing, beautifully simple.
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Try it right here — this is the real editor.
          </p>
        </div>

        <div className="relative mx-auto max-w-[1400px]">
          <DemoEditorLoader />
        </div>

        <div className="relative mx-auto mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-center">
          <Link
            href="/pricing"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg bg-accent px-8 py-3 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent/90 sm:w-auto"
          >
            Get BellaMD — $25/year
          </Link>
          <Link
            href="/download"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border px-8 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
          >
            Download for macOS
          </Link>
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
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-background p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
              >
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
            <div className="mt-8 flex items-center justify-center gap-4">
              <Image
                src="/icon.png"
                alt="BellaMD icon"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div className="text-left">
                <span className="text-5xl font-bold tracking-tight text-foreground">
                  $25
                </span>
                <span className="ml-1 text-lg text-muted-foreground">/year</span>
              </div>
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
              <FaApple className="h-8 w-8 text-muted-foreground" />
              <FaWindows className="h-8 w-8 text-muted-foreground" />
              <FaLinux className="h-8 w-8 text-muted-foreground" />
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
