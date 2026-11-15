import { CalendarCheck, CheckCircle2, TriangleAlert, XCircle } from "lucide-react"
import Link from "next/link"

import { saveAttendanceAction } from "@/app/actions/attendance"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SubmitButton } from "@/components/submit-button"
import { inputClass, selectClass } from "@/components/form-fields"
import { readDb } from "@/lib/db"
import { SEMESTERS } from "@/lib/grading"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const metadata = { title: "Attendance" }

function today(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${month}-${day}`
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string
    department?: string
    semester?: string
    saved?: string
    error?: string
  }>
}) {
  const sp = await searchParams
  const db = await readDb()

  const date = sp.date ?? today()
  const departmentId = sp.department ?? db.departments[0]?.id ?? ""
  const semester = sp.semester ? Number(sp.semester) : 1

  const groupStudents = db.students
    .filter(
      (s) => s.departmentId === departmentId && s.semester === semester && s.status === "active"
    )
    .sort((a, b) => a.roll.localeCompare(b.roll))

  const existing = db.attendance.find(
    (a) => a.date === date && a.departmentId === departmentId && a.semester === semester
  )

  const deptName = db.departments.find((d) => d.id === departmentId)?.name ?? ""

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          Mark daily attendance for a technology & semester group.
        </p>
      </div>

      {sp.saved ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" /> Attendance saved for {date}.
        </p>
      ) : null}
      {sp.error === "nostudents" ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <TriangleAlert className="size-4" /> No active students in this group.
        </p>
      ) : null}

      {/* Picker */}
      <form
        action="/dashboard/attendance"
        method="get"
        className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[180px_1fr_140px_auto]"
      >
        <input
          type="date"
          name="date"
          defaultValue={date}
          required
          className={inputClass}
          aria-label="Date"
        />
        <select name="department" defaultValue={departmentId} className={selectClass} aria-label="Technology">
          {db.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.short} — {d.name}
            </option>
          ))}
        </select>
        <select name="semester" defaultValue={semester} className={selectClass} aria-label="Semester">
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
        >
          <CalendarCheck className="size-4" /> Load group
        </button>
      </form>

      {/* Marking sheet */}
      <Card>
        <CardHeader>
          <CardTitle>
            {deptName} · Semester {semester} · {date}
          </CardTitle>
          <CardDescription>
            {existing
              ? "Already marked — you can update it and save again."
              : "Uncheck the students who are absent today. Everyone is marked present by default."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No active students in this group.
            </p>
          ) : (
            <form action={saveAttendanceAction} className="flex flex-col gap-4">
              <input type="hidden" name="date" value={date} />
              <input type="hidden" name="departmentId" value={departmentId} />
              <input type="hidden" name="semester" value={semester} />

              <div className="grid gap-2 sm:grid-cols-2">
                {groupStudents.map((s) => {
                  const initiallyPresent = existing
                    ? existing.present.includes(s.id)
                    : true
                  return (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors",
                        "has-checked:border-primary/60 has-checked:bg-primary/5"
                      )}
                    >
                      <input
                        type="checkbox"
                        name="present"
                        value={s.id}
                        defaultChecked={initiallyPresent}
                        className="size-4 accent-(--primary)"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {s.roll}
                      </span>
                      <span className="truncate font-medium">{s.name}</span>
                    </label>
                  )
                })}
              </div>

              <div className="flex items-center gap-3">
                <SubmitButton pendingText="Saving…">
                  <CheckCircle2 /> Save attendance
                </SubmitButton>
                <p className="text-xs text-muted-foreground">
                  {groupStudents.length} students in this group.
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Recent history for this group */}
      <Card>
        <CardHeader>
          <CardTitle>Recent days (this group)</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const history = db.attendance
              .filter(
                (a) => a.departmentId === departmentId && a.semester === semester
              )
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 8)
            if (history.length === 0) {
              return (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No attendance recorded yet for this group.
                </p>
              )
            }
            return (
              <div className="flex flex-col divide-y divide-border">
                {history.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/attendance?date=${a.date}&department=${a.departmentId}&semester=${a.semester}`}
                    className="flex items-center gap-3 py-2.5 text-sm hover:text-primary"
                  >
                    <span className="font-mono text-xs">{a.date}</span>
                    <span className="ml-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> {a.present.length}
                    </span>
                    <span className="flex w-14 justify-end items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="size-3.5" /> {a.absent.length}
                    </span>
                  </Link>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}
