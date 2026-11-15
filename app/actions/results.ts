"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { newId, readDb, writeDb } from "@/lib/db"
import { gpaFor, gradeFor } from "@/lib/grading"

export async function createResultAction(formData: FormData): Promise<void> {
  await requireSession()

  const studentId = String(formData.get("studentId") ?? "")
  const semester = Number(formData.get("semester"))
  const names = formData.getAll("subjectName").map(String)
  const marks = formData.getAll("subjectMarks").map(Number)

  const db = await readDb()
  const student = db.students.find((s) => s.id === studentId)
  if (!student) {
    redirect("/dashboard/results/new?error=student")
  }
  if (!Number.isFinite(semester) || semester < 1 || semester > 8) {
    redirect("/dashboard/results/new?error=semester")
  }

  const existing = db.results.find(
    (r) => r.studentId === studentId && r.semester === semester
  )
  if (existing) {
    redirect(`/dashboard/results/new?error=exists&student=${studentId}&semester=${semester}`)
  }

  const subjects = names
    .map((name, i) => {
      const mark = marks[i]
      if (!name.trim() || !Number.isFinite(mark)) return null
      const { grade, point } = gradeFor(mark)
      return { name: name.trim(), marks: mark, grade, point }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  if (subjects.length === 0) {
    redirect("/dashboard/results/new?error=subjects")
  }

  db.results.push({
    id: newId(),
    studentId,
    semester,
    subjects,
    gpa: gpaFor(subjects.map((s) => s.marks)),
    createdAt: new Date().toISOString(),
  })
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/results")
  redirect("/dashboard/results?created=1")
}

export async function deleteResultAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const db = await readDb()
  db.results = db.results.filter((r) => r.id !== id)
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/results")
  redirect("/dashboard/results?deleted=1")
}
