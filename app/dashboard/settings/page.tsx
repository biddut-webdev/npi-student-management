import { ShieldCheck, TriangleAlert, UserCircle2 } from "lucide-react"

import { updateAccountAction } from "@/app/actions/auth"
import { PasswordInput } from "@/components/password-input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/submit-button"
import { Field, inputClass } from "@/components/form-fields"
import { requireSession } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const metadata = { title: "Settings" }

const ERRORS: Record<string, string> = {
  missing: "Name and username are required.",
  wrongpassword: "The current password is not correct.",
  weakpassword: "The new password must be at least 6 characters.",
  duplicate: "That username is already taken.",
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const flags = await searchParams
  const session = await requireSession()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage the administrator account of the system.
        </p>
      </div>

      {flags.error && ERRORS[flags.error] ? (
        <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {ERRORS[flags.error]}
        </p>
      ) : null}
      {flags.saved ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="size-4" /> Account updated. If you changed the
          password, sign in again with the new one.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="size-4 text-primary" /> Administrator account
          </CardTitle>
          <CardDescription>
            Changing the password invalidates existing sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateAccountAction} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name" required>
                <input name="name" required defaultValue={session.name} className={inputClass} />
              </Field>
              <Field label="Username" required>
                <input name="username" required defaultValue={session.username} className={inputClass} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Current password" hint="Only needed when setting a new password.">
                <PasswordInput name="currentPassword" autoComplete="current-password" />
              </Field>
              <Field label="New password" hint="Minimum 6 characters. Leave empty to keep the current one.">
                <PasswordInput name="newPassword" autoComplete="new-password" />
              </Field>
            </div>
            <div>
              <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
