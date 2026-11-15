"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { createSession, destroySession, requireSession, verifyCredentials } from "@/lib/auth"
import { readDb, writeDb } from "@/lib/db"
import { hashPassword } from "@/lib/password"

export async function loginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "")
  const password = String(formData.get("password") ?? "")

  if (!username.trim() || !password) {
    redirect("/login?error=missing")
  }

  const db = await readDb()
  const user = db.users.find((u) => verifyCredentials(u, username, password))

  if (!user) {
    redirect("/login?error=invalid")
  }

  await createSession(user)
  redirect("/dashboard")
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect("/")
}

export async function updateAccountAction(formData: FormData): Promise<void> {
  const session = await requireSession()

  const name = String(formData.get("name") ?? "").trim()
  const username = String(formData.get("username") ?? "").trim()
  const currentPassword = String(formData.get("currentPassword") ?? "")
  const newPassword = String(formData.get("newPassword") ?? "")

  if (!name || !username) {
    redirect("/dashboard/settings?error=missing")
  }

  const db = await readDb()
  const user = db.users.find((u) => u.username === session.username)
  if (!user) {
    redirect("/login?error=invalid")
  }

  // Changing the password requires the current one.
  if (newPassword) {
    if (!verifyCredentials(user, session.username, currentPassword)) {
      redirect("/dashboard/settings?error=wrongpassword")
    }
    if (newPassword.length < 6) {
      redirect("/dashboard/settings?error=weakpassword")
    }
    user.passwordHash = hashPassword(newPassword)
  }

  const duplicate = db.users.some(
    (u) => u.username === username && u.username !== session.username
  )
  if (duplicate) {
    redirect("/dashboard/settings?error=duplicate")
  }

  user.name = name
  user.username = username
  await writeDb(db)

  revalidatePath("/dashboard")
  redirect("/dashboard/settings?saved=1")
}
