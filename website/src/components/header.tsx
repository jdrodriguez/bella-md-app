import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <Image
            src="/icon.png"
            alt="BellaMD icon"
            width={24}
            height={24}
            className="rounded-md"
          />
          BellaMD
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="#features"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/download"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Download
          </Link>
          <Link
            href="/login"
            className="ml-2 inline-flex min-h-[44px] items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Login
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="sm:hidden">
      <details className="group relative">
        <summary className="flex min-h-[44px] min-w-[44px] cursor-pointer list-none items-center justify-center rounded-md transition-colors hover:bg-muted">
          <svg
            className="h-5 w-5 text-foreground group-open:hidden"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
          <svg
            className="hidden h-5 w-5 text-foreground group-open:block"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </summary>
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background p-2 shadow-lg">
          <Link
            href="#features"
            className="block min-h-[44px] rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            className="block min-h-[44px] rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/download"
            className="block min-h-[44px] rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Download
          </Link>
          <div className="my-1 border-t border-border" />
          <Link
            href="/login"
            className="block min-h-[44px] rounded-md bg-accent px-3 py-2.5 text-center text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Login
          </Link>
        </div>
      </details>
    </div>
  );
}
