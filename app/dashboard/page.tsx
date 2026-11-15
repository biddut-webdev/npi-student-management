import Link from "next/link"
import {
  ArrowRight,
  BookOpenCheck,
  CalendarCheck,
  Percent,
  School,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const db = await readDb()
  const students = db.students
  const active = students.filter((s) => s.status === "active")

  const deptCounts = db.departments
    .map((d) => ({
      dept: d,
      count: students.filter((s) => s.departmentId === d.id && s.status === "active")
        .length,
    }))
    .sort((a, b) => b.count - a.count)
  const maxDept = Math.max(1, ...deptCounts.map((c) => c.count))

  const semesterCounts = Array.from({ length: 8 }, (_, i) => ({
    semester: i + 1,
    count: students.filter((s) => s.semester === i + 1 && s.status === "active").length,
  }))
  const maxSemester = Math.max(1, ...semesterCounts.map((c) => c.count))

  // Attendance percentage over the last 30 recorded days.
  const recentAttendance = db.attendance
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30)
  const totalMarked = recentAttendance.reduce(
    (sum, a) => sum + a.present.length + a.absent.length,
    0
  )
  const totalPresent = recentAttendance.reduce((sum, a) => sum + a.present.length, 0)
  const attendancePct =
    totalMarked > 0 ? Math.round((totalPresent / totalMarked) * 100) : null

  const recentStudents = students
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)

  const cards = [
    { label: "Total students", value: students.length, icon: Users, sub: `${active.length} active` },
    { label: "Technologies", value: db.departments.length, icon: School, sub: "BTEB approved" },
    { label: "Published results", value: db.results.length, icon: BookOpenCheck, sub: "Semester results" },
    {
      label: "Attendance (last 30 classes)",
      value: attendancePct === null ? "—" : `${attendancePct}%`,
      icon: Percent,
      sub: "Avg. across all groups",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of the institute at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href="/dashboard/students/new" />} nativeButton={false} size="sm">
            <Users /> Add student
          </Button>
          <Button
            render={<Link href="/dashboard/attendance" />}
            nativeButton={false}
            variant="outline"
            size="sm"
          >
            <CalendarCheck /> Take attendance
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {c.label}
                <c.icon className="size-4 text-primary" />
              </CardDescription>
              <CardTitle className="font-heading text-3xl">{c.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="size-4 text-primary" /> Students per technology
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {deptCounts.map(({ dept, count }) => (
              <div key={dept.id} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate text-muted-foreground" title={dept.name}>
                  {dept.short}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((count / maxDept) * 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Students per semester
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2 pt-2">
            {semesterCounts.map((s) => (
              <div key={s.semester} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-medium">{s.count}</span>
                <div className="flex h-28 w-full max-w-8 items-end overflow-hidden rounded-md bg-muted">
                  <div
                    className="w-full rounded-md bg-primary/85"
                    style={{
                      height: `${Math.max(4, Math.round((s.count / maxSemester) * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground">S{s.semester}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent students */}
      <Card>
        <CardHeader>
          <CardTitle>Recently admitted</CardTitle>
          <CardDescription>The latest students added to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No students yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recentStudents.map((s) => {
                const dept = db.departments.find((d) => d.id === s.departmentId)
                return (
                  <Link
                    key={s.id}
                    href={`/dashboard/students/${s.id}`}
                    className="flex items-center gap-3 py-2.5 text-sm hover:text-primary"
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                      {s.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                    <span className="hidden text-muted-foreground sm:block">
                      {dept?.short} · Sem {s.semester}
                    </span>
                    <Badge variant="outline">Roll {s.roll}</Badge>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
