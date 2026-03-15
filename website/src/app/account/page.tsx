import { redirect } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { licenses } from "@/db/schema"
import { CopyButton } from "./copy-button"
import { SignOutButton } from "./sign-out-button"

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.userId, session.user.id),
    with: { activations: true },
  })

  const activeDevices = license?.activations?.filter(
    (a) => a.deactivatedAt === null,
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            BellaMD
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {params.success === "true" && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            Your purchase was successful. Your license is now active.
          </div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Account
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {session.user.email}
        </p>

        {license ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-border bg-white p-6 shadow-sm dark:bg-zinc-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    License key
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                      {license.licenseKey}
                    </code>
                    <CopyButton text={license.licenseKey} />
                  </div>
                </div>
                <StatusBadge status={license.status ?? "active"} />
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Plan
                  </dt>
                  <dd className="mt-1 text-sm capitalize text-zinc-900 dark:text-zinc-100">
                    {license.plan ?? "Annual"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Expires
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                    {license.expiresAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Devices
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                    {activeDevices?.length ?? 0} of {license.maxDevices ?? 3}{" "}
                    used
                  </dd>
                </div>
              </dl>
            </div>

            <Link
              href="/account/devices"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Manage devices
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              No active license
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Purchase a license to start using BellaMD on your devices.
            </p>
            <Link
              href="/pricing"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-6 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              View pricing
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
    expired:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    suspended:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
    revoked:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] ?? styles.active}`}
    >
      {status}
    </span>
  )
}
