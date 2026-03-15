import { redirect } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { licenses } from "@/db/schema"
import { DeactivateButton } from "./deactivate-button"

export default async function DevicesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.userId, session.user.id),
    with: { activations: true },
  })

  if (!license) redirect("/account")

  const activeDevices =
    license.activations?.filter((a) => a.deactivatedAt === null) ?? []
  const maxDevices = license.maxDevices ?? 3

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            BellaMD
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/account"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          Back to account
        </Link>

        <div className="mt-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Devices
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {activeDevices.length} of {maxDevices} devices used
          </p>
        </div>

        {activeDevices.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No devices are currently activated. Open BellaMD on a device and
              enter your license key to activate it.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-border bg-white shadow-sm sm:block dark:bg-zinc-900">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-zinc-50 dark:bg-zinc-800/50">
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                      Device
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                      OS
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                      Activated
                    </th>
                    <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                      Last seen
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeDevices.map((device) => (
                    <tr key={device.id}>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {device.machineName || "Unknown device"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {device.os || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {device.activatedAt?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {device.lastHeartbeatAt?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "-"}
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
                  className="rounded-lg border border-border bg-white p-4 shadow-sm dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {device.machineName || "Unknown device"}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
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
                      <dt className="text-zinc-500 dark:text-zinc-400">
                        Activated
                      </dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">
                        {device.activatedAt?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-zinc-500 dark:text-zinc-400">
                        Last seen
                      </dt>
                      <dd className="text-zinc-900 dark:text-zinc-100">
                        {device.lastHeartbeatAt?.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }) ?? "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
