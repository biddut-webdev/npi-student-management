import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHash } from "node:crypto"

import type { User } from "./types"
import { readDb } from "./db"
import { hashPassword } from "./password"

const SESSION_COOKIE = "npi_session"
/** Constant signing secret — fine for a local college project. */
const SECRET = "npi-student-management::v1"

function tokenFor(user: User): string {
  return createHash("sha256")
    .update(`${user.username}:${user.passwordHash}:${SECRET}`)
    .digest("hex")
}

/** Returns the logged-in admin, or null. */
export async function getSession(): Promise<User | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const db = await readDb()
  const user = db.users.find((u) => tokenFor(u) === token)
  return user ?? null
}

/** For server actions & protected layouts: redirects to /login when not signed in. */
export async function requireSession(): Promise<User> {
  const user = await getSession()
  if (!user) redirect("/login")
  return user
}

export async function createSession(user: User): Promise<void> {
  const store = await cookies()
  store.set(SESSION_COOKIE, tokenFor(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // one week
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

export function verifyCredentials(
  user: User,
  username: string,
  password: string
): boolean {
  return (
    user.username === username.trim() &&
    user.passwordHash === hashPassword(password)
  )
}
