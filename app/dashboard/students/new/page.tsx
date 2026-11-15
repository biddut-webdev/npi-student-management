import Link from "next/link"
import { ArrowLeft, TriangleAlert } from "lucide-react"

import { StudentForm } from "@/components/dashboard/student-form"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Add Student" }

const ERRORS: Record<string, string> = {
  missing: "Please fill in all required fields.",
  duplicate: "A student with this roll number already exists.",
  department: "Please select a valid technology.",
}

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const db = await readDb()

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/students"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Students
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Add new student</h1>
        <p className="text-sm text-muted-foreground">
          Register a new student of Naogaon Polytechnic Institute.
        </p>
      </div>

      {error && ERRORS[error] ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {ERRORS[error]}
        </p>
      ) : null}

      <StudentForm mode="create" departments={db.departments} />
    </div>
  )
}
