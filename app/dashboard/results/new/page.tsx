import Link from "next/link"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { ResultForm } from "@/components/dashboard/result-form"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Publish Result" }

const ERRORS: Record<string, string> = {
  student: "Please select a student.",
  semester: "Please select a valid semester (1-8).",
  subjects: "Enter at least one subject with marks between 0 and 100.",
  exists: "This student already has a result for that semester. Delete it first to re-publish.",
}

export default async function NewResultPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; student?: string; semester?: string }>
}) {
  const { error } = await searchParams
  const db = await readDb()

  const students = db.students
    .filter((s) => s.status === "active")
    .sort((a, b) => a.roll.localeCompare(b.roll))
    .map((s) => {
      const dept = db.departments.find((d) => d.id === s.departmentId)
      return { id: s.id, label: `${s.roll} — ${s.name} (${dept?.short ?? "?"}, Sem ${s.semester})` }
    })

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/results"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Results
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Publish semester result</h1>
        <p className="text-sm text-muted-foreground">
          Add subjects with marks — GPA is calculated automatically using the BTEB
          grading scale.
        </p>
      </div>

      {error && ERRORS[error] ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {ERRORS[error]}
        </p>
      ) : null}

      {students.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          No active students yet — add a student first.
        </p>
      ) : (
        <ResultForm students={students} />
      )}
    </div>
  )
}
