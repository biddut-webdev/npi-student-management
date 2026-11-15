import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"

import { deleteResultAction } from "@/app/actions/results"
import { Badge } from "@/components/ui/badge"
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
import { ConfirmSubmit } from "@/components/submit-button"
import { selectClass } from "@/components/form-fields"
import { readDb } from "@/lib/db"
import { gpaColor, SEMESTERS } from "@/lib/grading"

export const dynamic = "force-dynamic"
export const metadata = { title: "Results" }

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string; sem?: string; created?: string; deleted?: string }>
}) {
  const filters = await searchParams
  const db = await readDb()

  const dept = filters.dept ?? ""
  const sem = filters.sem ?? ""

  const results = db.results
    .filter((r) => {
      if (dept) {
        const s = db.students.find((x) => x.id === r.studentId)
        if (!s || s.departmentId !== dept) return false
      }
      if (sem && r.semester !== Number(sem)) return false
      return true
    })
    .map((r) => ({
      result: r,
      student: db.students.find((s) => s.id === r.studentId),
    }))
    .sort((a, b) => a.student?.roll.localeCompare(b.student?.roll ?? "") || 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Results</h1>
          <p className="text-sm text-muted-foreground">
            {db.results.length} semester results published.
          </p>
        </div>
        <Link
          href="/dashboard/results/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium whitespace-nowrap text-primary-foreground transition-all hover:bg-primary/80"
        >
          <Plus className="size-4" /> Publish result
        </Link>
      </div>

      {filters.created ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Result published successfully.
        </p>
      ) : null}
      {filters.deleted ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          Result deleted.
        </p>
      ) : null}

      {/* Filters */}
      <form
        action="/dashboard/results"
        method="get"
        className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[240px_160px_auto]"
      >
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
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
        >
          Filter
        </button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Published results</CardTitle>
          <CardDescription>
            {results.length} result{results.length === 1 ? "" : "s"} shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No results found for this filter.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map(({ result, student }) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-mono text-xs">
                      {student?.roll ?? "—"}
                    </TableCell>
                    <TableCell>
                      {student ? (
                        <Link
                          href={`/dashboard/students/${student.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {student.name}
                        </Link>
                      ) : (
                        "Deleted student"
                      )}
                    </TableCell>
                    <TableCell>Sem {result.semester}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.subjects.length} subjects</Badge>
                    </TableCell>
                    <TableCell className={`font-semibold ${gpaColor(result.gpa)}`}>
                      {result.gpa.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={deleteResultAction} className="inline-flex">
                        <input type="hidden" name="id" value={result.id} />
                        <ConfirmSubmit
                          message={`Delete the semester ${result.semester} result of ${student?.name ?? "this student"}?`}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-red-600 outline-none transition-all hover:bg-red-500/10 dark:text-red-400"
                        >
                          <Trash2 className="size-4" /> Delete
                        </ConfirmSubmit>
                      </form>
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
