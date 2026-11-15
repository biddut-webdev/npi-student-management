import { requireSession } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"

export const metadata = { title: "Dashboard" }

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  return <DashboardShell adminName={session.name}>{children}</DashboardShell>
}
