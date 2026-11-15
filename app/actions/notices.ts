"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireSession } from "@/lib/auth"
import { newId, readDb, writeDb } from "@/lib/db"
import type { Notice } from "@/lib/types"

export async function createNoticeAction(formData: FormData): Promise<void> {
  await requireSession()

  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  const pinned = formData.get("pinned") === "on"

  if (!title || !body) {
    redirect("/dashboard/notices?error=missing")
  }

  const notice: Notice = {
    id: newId(),
    title,
    body,
    date: new Date().toISOString(),
    pinned,
  }
  const db = await readDb()
  db.notices.unshift(notice)
  await writeDb(db)

  revalidatePath("/dashboard/notices")
  revalidatePath("/")
  redirect("/dashboard/notices?created=1")
}

export async function updateNoticeAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  const pinned = formData.get("pinned") === "on"

  if (!title || !body) {
    redirect(`/dashboard/notices?error=missing&edit=${id}`)
  }

  const db = await readDb()
  const notice = db.notices.find((n) => n.id === id)
  if (!notice) {
    redirect("/dashboard/notices")
  }

  Object.assign(notice, { title, body, pinned })
  await writeDb(db)

  revalidatePath("/dashboard/notices")
  revalidatePath("/")
  redirect("/dashboard/notices?saved=1")
}

export async function deleteNoticeAction(formData: FormData): Promise<void> {
  await requireSession()

  const id = String(formData.get("id") ?? "")
  const db = await readDb()
  db.notices = db.notices.filter((n) => n.id !== id)
  await writeDb(db)

  revalidatePath("/dashboard/notices")
  revalidatePath("/")
  redirect("/dashboard/notices?deleted=1")
}
