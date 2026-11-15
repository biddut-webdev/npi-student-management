"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { newId, readDb, writeDb } from "@/lib/db"
import type { Department } from "@/lib/types"

export async function createDepartmentAction(formData: FormData): Promise<void> {
  await requireSession()

  const name = String(formData.get("name") ?? "").trim()
  const short = String(formData.get("short") ?? "").trim()
  const code = Number(formData.get("code"))

  if (!name || !short || !Number.isFinite(code) || code <= 0) {
    redirect("/dashboard/departments?error=missing")
  }

  const db = await readDb()
  if (
    db.departments.some(
      (d) => d.short.toLowerCase() === short.toLowerCase() || d.code === code
    )
  ) {
    redirect("/dashboard/departments?error=duplicate")
  }

  const department: Department = {
    id: newId(),
    name,
    short,
    code,
    createdAt: new Date().toISOString(),
  }
  db.departments.push(department)
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/departments")
  redirect("/dashboard/departments?created=1")
}

export async function updateDepartmentAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const name = String(formData.get("name") ?? "").trim()
  const short = String(formData.get("short") ?? "").trim()
  const code = Number(formData.get("code"))

  if (!name || !short || !Number.isFinite(code) || code <= 0) {
    redirect("/dashboard/departments?error=missing")
  }

  const db = await readDb()
  const department = db.departments.find((d) => d.id === id)
  if (!department) {
    redirect("/dashboard/departments")
  }

  const duplicate = db.departments.some(
    (d) =>
      d.id !== id &&
      (d.short.toLowerCase() === short.toLowerCase() || d.code === code)
  )
  if (duplicate) {
    redirect("/dashboard/departments?error=duplicate")
  }

  Object.assign(department, { name, short, code })
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/departments")
  redirect("/dashboard/departments?saved=1")
}

export async function deleteDepartmentAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const db = await readDb()

  if (db.students.some((s) => s.departmentId === id)) {
    // Move students of this department to the first remaining department so
    // nothing is orphaned.
    const fallback = db.departments.find((d) => d.id !== id)
    if (fallback) {
      for (const s of db.students) {
        if (s.departmentId === id) s.departmentId = fallback.id
      }
    }
  }

  db.departments = db.departments.filter((d) => d.id !== id)
  db.attendance = db.attendance.filter((a) => a.departmentId !== id)
  await writeDb(db)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/departments")
  redirect("/dashboard/departments?deleted=1")
}
