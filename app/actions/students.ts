"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { newId, readDb, writeDb } from "@/lib/db"
import type { Student, StudentStatus, Shift } from "@/lib/types"

function studentFromForm(
  formData: FormData,
  existing?: Student
): Omit<Student, "id" | "createdAt"> {
  const semester = Number(formData.get("semester") ?? existing?.semester ?? 1)
  return {
    roll: String(formData.get("roll") ?? existing?.roll ?? "").trim(),
    name: String(formData.get("name") ?? existing?.name ?? "").trim(),
    email: String(formData.get("email") ?? existing?.email ?? "").trim(),
    phone: String(formData.get("phone") ?? existing?.phone ?? "").trim(),
    departmentId: String(formData.get("departmentId") ?? existing?.departmentId ?? ""),
    semester: Math.min(8, Math.max(1, Number.isFinite(semester) ? semester : 1)),
    shift: (String(formData.get("shift") ?? existing?.shift ?? "1st") as Shift),
    session: String(formData.get("session") ?? existing?.session ?? "").trim(),
    guardianName: String(formData.get("guardianName") ?? existing?.guardianName ?? "").trim(),
    guardianPhone: String(formData.get("guardianPhone") ?? existing?.guardianPhone ?? "").trim(),
    address: String(formData.get("address") ?? existing?.address ?? "").trim(),
    dob: String(formData.get("dob") ?? existing?.dob ?? ""),
    bloodGroup: String(formData.get("bloodGroup") ?? existing?.bloodGroup ?? "").trim(),
    status: (String(formData.get("status") ?? existing?.status ?? "active") as StudentStatus),
  }
}

export async function createStudentAction(formData: FormData): Promise<void> {
  await requireSession()

  const data = studentFromForm(formData)
  if (!data.roll || !data.name || !data.departmentId || !data.session) {
    redirect("/dashboard/students/new?error=missing")
  }

  const db = await readDb()
  if (db.students.some((s) => s.roll.toLowerCase() === data.roll.toLowerCase())) {
    redirect("/dashboard/students/new?error=duplicate")
  }
  if (!db.departments.some((d) => d.id === data.departmentId)) {
    redirect("/dashboard/students/new?error=department")
  }

  const student: Student = { id: newId(), createdAt: new Date().toISOString(), ...data }
  db.students.push(student)
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/students")
  redirect(`/dashboard/students/${student.id}`)
}

export async function updateStudentAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const db = await readDb()
  const student = db.students.find((s) => s.id === id)
  if (!student) {
    redirect("/dashboard/students")
  }

  const data = studentFromForm(formData, student)
  if (!data.roll || !data.name || !data.departmentId || !data.session) {
    redirect(`/dashboard/students/${id}/edit?error=missing`)
  }

  const duplicate = db.students.some(
    (s) => s.id !== id && s.roll.toLowerCase() === data.roll.toLowerCase()
  )
  if (duplicate) {
    redirect(`/dashboard/students/${id}/edit?error=duplicate`)
  }

  Object.assign(student, data)
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/students")
  redirect(`/dashboard/students/${id}`)
}

export async function deleteStudentAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const db = await readDb()

  db.students = db.students.filter((s) => s.id !== id)
  // Keep data consistent: remove the student's results too.
  db.results = db.results.filter((r) => r.studentId !== id)
  // Remove the student from any attendance records.
  for (const att of db.attendance) {
    att.present = att.present.filter((sid) => sid !== id)
    att.absent = att.absent.filter((sid) => sid !== id)
  }
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/students")
  redirect("/dashboard/students?deleted=1")
}
