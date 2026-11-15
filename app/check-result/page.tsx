import Link from "next/link"
import { GraduationCap, Search, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/submit-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { inputClass, selectClass } from "@/components/form-fields"
import { readDb } from "@/lib/db"
import { SEMESTERS, gpaColor } from "@/lib/grading"

export const dynamic = "force-dynamic"
export const metadata = { title: "Check Result" }

export default async function CheckResultPage({
  searchParams,
}: {
  searchParams: Promise<{ roll?: string; semester?: string }>
}) {
  const { roll = "", semester = "" } = await searchParams
  const db = await readDb()

  const student = roll
    ? db.students.find(
        (s) => s.roll.toLowerCase() === roll.trim().toLowerCase()
      )
    : undefined

  const department = student
    ? db.departments.find((d) => d.id === student.departmentId)
    : undefined

  const results = student
    ? db.results
        .filter(
          (r) =>
            r.studentId === student.id &&
            (!semester || r.semester === Number(semester))
        )
        .sort((a, b) => a.semester - b.semester)
    : []

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="size-5 text-primary" />
            <span className="text-sm font-semibold">NPI</span>
          </Link>
          <span className="text-sm text-muted-foreground">Check Result</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-heading text-2xl font-semibold">
          Check your semester result
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your roll number to see your published results.
        </p>

        <form
          action="/check-result"
          method="get"
          className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_200px_auto]"
        >
          <input
            name="roll"
            required
            defaultValue={roll}
            placeholder="e.g. 672401"
            className={inputClass}
          />
          <select
            name="semester"
            defaultValue={semester}
            className={selectClass}
            aria-label="Semester"
          >
            <option value="">All semesters</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
          <SubmitButton pendingText="Searching…">
            <Search /> Search
          </SubmitButton>
        </form>

        {roll && !student ? (
          <p className="mt-6 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            No student found with roll “{roll}”. Check the roll and try again.
          </p>
        ) : null}

        {student ? (
          <div className="mt-8 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {student.name}
                  <Badge variant="secondary">Roll {student.roll}</Badge>
                </CardTitle>
                <CardDescription>
                  {department?.name} · Semester {student.semester} ·{" "}
                  {student.shift} shift · Session {student.session}
                </CardDescription>
              </CardHeader>
            </Card>

            {results.length === 0 ? (
              <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                No results published yet for this selection.
              </p>
            ) : (
              results.map((r) => (
                <Card key={r.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Semester {r.semester} result
                      <span className={`font-heading text-lg font-semibold ${gpaColor(r.gpa)}`}>
                        GPA {r.gpa.toFixed(2)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Published{" "}
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="py-1.5 font-medium">Subject</th>
                          <th className="py-1.5 font-medium">Marks</th>
                          <th className="py-1.5 font-medium">Grade</th>
                          <th className="py-1.5 font-medium">Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.subjects.map((s, i) => (
                          <tr key={i} className="border-b border-border/60 last:border-0">
                            <td className="py-1.5">{s.name}</td>
                            <td className="py-1.5">{s.marks}</td>
                            <td className="py-1.5">{s.grade}</td>
                            <td className="py-1.5">{s.point.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
