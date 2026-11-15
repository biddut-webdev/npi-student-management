import { createHash } from "node:crypto"

const SECRET = "npi-student-management::v1"

export function hashPassword(password: string): string {
  return createHash("sha256").update(`${SECRET}:${password}`).digest("hex")
}
