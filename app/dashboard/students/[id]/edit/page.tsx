import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { StudentForm } from "@/components/dashboard/student-form"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Edit Student" }

const ERRORS: Record<string, string> = {
  missing: "Please fill in all required fields.",
  duplicate: "Another student already uses this roll number.",
}

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams])
  const db = await readDb()
  const student = db.students.find((s) => s.id === id)
  if (!student) notFound()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href={`/dashboard/students/${student.id}`}
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to profile
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Edit {student.name}</h1>
        <p className="text-sm text-muted-foreground">
          Update the student&apos;s information and save.
        </p>
      </div>

      {error && ERRORS[error] ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {ERRORS[error]}
        </p>
      ) : null}

      <StudentForm mode="edit" departments={db.departments} student={student} />
    </div>
  )
}
