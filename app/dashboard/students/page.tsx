import Link from "next/link"
import { Plus, UserSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { inputClass, selectClass } from "@/components/form-fields"
import { readDb } from "@/lib/db"
import { SEMESTERS } from "@/lib/grading"

export const dynamic = "force-dynamic"
export const metadata = { title: "Students" }

type Filters = { q?: string; dept?: string; sem?: string; shift?: string; error?: string; deleted?: string }

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Filters>
}) {
  const filters = await searchParams
  const db = await readDb()

  const q = (filters.q ?? "").trim().toLowerCase()
  const dept = filters.dept ?? ""
  const sem = filters.sem ?? ""
  const shift = filters.shift ?? ""

  const students = db.students
    .filter((s) => {
      if (q && !`${s.name} ${s.roll} ${s.email}`.toLowerCase().includes(q)) return false
      if (dept && s.departmentId !== dept) return false
      if (sem && s.semester !== Number(sem)) return false
      if (shift && s.shift !== shift) return false
      return true
    })
    .sort((a, b) => a.roll.localeCompare(b.roll))

  const deptName = (id: string) =>
    db.departments.find((d) => d.id === id)?.short ?? "—"

  const hasFilters = Boolean(q || dept || sem || shift)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            {db.students.length} students enrolled in total.
          </p>
        </div>
        <Button render={<Link href="/dashboard/students/new" />} nativeButton={false} size="sm">
          <Plus /> Add student
        </Button>
      </div>

      {filters.deleted ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Student deleted successfully.
        </p>
      ) : null}

      {/* Filters (native GET form — works without JavaScript) */}
      <form
        action="/dashboard/students"
        method="get"
        className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_200px_140px_140px_auto]"
      >
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Search by name, roll or email…"
          className={inputClass}
        />
        <select name="dept" defaultValue={dept} className={selectClass} aria-label="Technology">
          <option value="">All technologies</option>
          {db.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.short} — {d.name}
            </option>
          ))}
        </select>
        <select name="sem" defaultValue={sem} className={selectClass} aria-label="Semester">
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
        <select name="shift" defaultValue={shift} className={selectClass} aria-label="Shift">
          <option value="">Both shifts</option>
          <option value="1st">1st shift</option>
          <option value="2nd">2nd shift</option>
        </select>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium whitespace-nowrap text-primary-foreground transition-all hover:bg-primary/80"
        >
          <UserSearch className="size-4" /> Filter
        </button>
        {hasFilters ? (
          <Link
            href="/dashboard/students"
            className="col-span-full text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear filters
          </Link>
        ) : null}
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Student list</CardTitle>
          <CardDescription>
            {students.length} student{students.length === 1 ? "" : "s"} found
            {hasFilters ? " (filtered)" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No students match. {hasFilters ? "Try clearing the filters." : "Add your first student!"}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Technology</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.roll}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/students/${s.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {s.name}
                      </Link>
                    </TableCell>
                    <TableCell>{deptName(s.departmentId)}</TableCell>
                    <TableCell>Sem {s.semester}</TableCell>
                    <TableCell>{s.shift}</TableCell>
                    <TableCell>{s.session}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          s.status === "active"
                            ? "default"
                            : s.status === "graduated"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/students/${s.id}`}
                        className="text-xs text-primary underline-offset-4 hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
