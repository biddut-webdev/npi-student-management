import Link from "next/link"
import { GraduationCap, Lock, TriangleAlert, User } from "lucide-react"

import { loginAction } from "@/app/actions/auth"
import { SubmitButton } from "@/components/submit-button"
import { PasswordInput } from "@/components/password-input"
import { inputClass } from "@/components/form-fields"
import { ThemeToggle } from "@/components/theme-toggle"

const ERRORS: Record<string, string> = {
  invalid: "Wrong username or password. Try again.",
  missing: "Please enter both username and password.",
}

export const metadata = { title: "Admin Login" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to website
        </Link>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <form
          action={loginAction}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
            <h1 className="font-heading text-lg font-semibold">NPI Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage students, results and notices.
            </p>
          </div>

          {error && ERRORS[error] ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {ERRORS[error]}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Username</span>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="username"
                  required
                  autoComplete="username"
                  placeholder="admin"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </label>
            <SubmitButton className="w-full" pendingText="Signing in…">
              Sign in
            </SubmitButton>
          </div>

          <p className="mt-6 rounded-lg bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
            Demo account — username <b>admin</b>, password <b>admin123</b>
          </p>
        </form>
      </div>
    </div>
  )
}
