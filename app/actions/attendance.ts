"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { newId, readDb, writeDb } from "@/lib/db"

export async function saveAttendanceAction(formData: FormData): Promise<void> {
  await requireSession()

  const date = String(formData.get("date") ?? "")
  const departmentId = String(formData.get("departmentId") ?? "")
  const semester = Number(formData.get("semester"))
  // Only checked checkboxes arrive; everything else is absent.
  const presentIds = formData.getAll("present").map(String)

  if (!date || !departmentId || !Number.isFinite(semester)) {
    redirect("/dashboard/attendance?error=missing")
  }

  const db = await readDb()
  const groupStudents = db.students.filter(
    (s) => s.departmentId === departmentId && s.semester === semester
  )

  if (groupStudents.length === 0) {
    redirect("/dashboard/attendance?error=nostudents")
  }

  const present: string[] = []
  const absent: string[] = []
  for (const s of groupStudents) {
    if (presentIds.includes(s.id)) present.push(s.id)
    else absent.push(s.id)
  }

  const existing = db.attendance.find(
    (a) => a.date === date && a.departmentId === departmentId && a.semester === semester
  )
  if (existing) {
    existing.present = present
    existing.absent = absent
  } else {
    db.attendance.push({
      id: newId(),
      date,
      departmentId,
      semester,
      present,
      absent,
    })
  }

  await writeDb(db)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/attendance")
  redirect(
    `/dashboard/attendance?saved=1&date=${date}&department=${departmentId}&semester=${semester}`
  )
}
