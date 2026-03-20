import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { licenses } from "@/db/schema"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CopyButton } from "./copy-button"
import { SignOutButton } from "./sign-out-button"
import { DeactivateButton } from "./deactivate-button"

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

  const activeDevices =
    license?.activations?.filter((a) => a.deactivatedAt === null) ?? []
  const maxDevices = license?.maxDevices ?? 3

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {params.success === "true" && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            Your purchase was successful. Your license is now active.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="BellaMD"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Account
              </h1>
              <p className="text-sm text-muted-foreground">
                {session.user.email ?? ""}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {license ? (
          <div className="mt-8 space-y-8">
            {/* License info */}
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground">
                    License key
                  </h2>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded-md bg-muted px-2.5 py-1 font-mono text-sm text-foreground">
                      {license.licenseKey}
                    </code>
                    <CopyButton text={license.licenseKey} />
                  </div>
                </div>
                <StatusBadge status={license.status ?? "active"} />
              </div>

              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Plan
                  </dt>
                  <dd className="mt-1 text-sm capitalize text-foreground">
                    {license.plan ?? "Annual"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Expires
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {license.expiresAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Devices
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {activeDevices.length} of {maxDevices} used
                  </dd>
                </div>
              </dl>
            </div>

            {/* Devices */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Devices
              </h2>

              {activeDevices.length === 0 ? (
                <div className="mt-4 rounded-xl border border-border bg-background p-6 text-center shadow-sm">
                  <p className="text-sm text-muted-foreground">
                    No devices activated. Open BellaMD on a device and enter your
                    license key to activate it.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {/* Desktop table */}
                  <div className="hidden overflow-hidden rounded-xl border border-border bg-background shadow-sm sm:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Device
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            OS
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Activated
                          </th>
                          <th className="px-4 py-3 font-medium text-muted-foreground">
                            Last seen
                          </th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {activeDevices.map((device) => (
                          <tr key={device.id}>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {device.machineName || "Unknown device"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {device.os || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {device.activatedAt?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {device.lastHeartbeatAt?.toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              ) ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DeactivateButton
                                licenseKey={license.licenseKey}
                                machineId={device.machineId}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 sm:hidden">
                    {activeDevices.map((device) => (
                      <div
                        key={device.id}
                        className="rounded-xl border border-border bg-background p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-foreground">
                              {device.machineName || "Unknown device"}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {device.os || "Unknown OS"}
                            </p>
                          </div>
                          <DeactivateButton
                            licenseKey={license.licenseKey}
                            machineId={device.machineId}
                          />
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Activated</dt>
                            <dd className="text-foreground">
                              {device.activatedAt?.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }) ?? "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Last seen</dt>
                            <dd className="text-foreground">
                              {device.lastHeartbeatAt?.toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              ) ?? "-"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-background p-8 text-center shadow-sm">
            <Image
              src="/icon.png"
              alt="BellaMD"
              width={48}
              height={48}
              className="mx-auto rounded-xl"
            />
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              No active license
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
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

        {/* Affiliate Program */}
        <div className="mt-8 rounded-xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            Earn with BellaMD
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Refer friends and earn 25% commission on every payment they make.
          </p>
          <Link
            href="/affiliate"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Go to affiliate dashboard &rarr;
          </Link>
        </div>
      </main>

      <Footer />
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
