import { Plus, School, Trash2, TriangleAlert, Users, X } from "lucide-react"

import {
  createDepartmentAction,
  deleteDepartmentAction,
  updateDepartmentAction,
} from "@/app/actions/departments"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmSubmit, SubmitButton } from "@/components/submit-button"
import { Field, inputClass } from "@/components/form-fields"
import { readDb } from "@/lib/db"

export const dynamic = "force-dynamic"
export const metadata = { title: "Departments" }

const MESSAGES: Record<string, string> = {
  missing: "Please fill in the technology name, short name and code.",
  duplicate: "A technology with this short name or code already exists.",
}

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    created?: string
    saved?: string
    deleted?: string
  }>
}) {
  const flags = await searchParams
  const db = await readDb()

  const message =
    flags.error
      ? { kind: "error", text: MESSAGES[flags.error] ?? "Something went wrong." }
      : flags.created
        ? { kind: "ok", text: "Technology added." }
        : flags.saved
          ? { kind: "ok", text: "Technology updated." }
          : flags.deleted
            ? { kind: "ok", text: "Technology deleted." }
            : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Departments</h1>
        <p className="text-sm text-muted-foreground">
          Manage the technology departments of the institute.
        </p>
      </div>

      {message ? (
        <p
          className={
            message.kind === "error"
              ? "flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          }
        >
          {message.kind === "error" ? (
            <TriangleAlert className="size-4" />
          ) : null}
          {message.text}
        </p>
      ) : null}

      {/* Add technology */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4 text-primary" /> Add a technology
          </CardTitle>
          <CardDescription>
            e.g. Computer Science & Technology, short CST, BTEB code 67.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={createDepartmentAction}
            className="grid gap-3 sm:grid-cols-[1fr_140px_120px_auto]"
          >
            <Field label="Full name">
              <input name="name" required placeholder="Computer Science & Technology" className={inputClass} />
            </Field>
            <Field label="Short name">
              <input name="short" required placeholder="CST" className={inputClass} />
            </Field>
            <Field label="Code">
              <input name="code" required type="number" min={1} placeholder="67" className={inputClass} />
            </Field>
            <div className="flex items-end">
              <SubmitButton pendingText="Adding…">
                <Plus /> Add
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing technologies */}
      <div className="grid gap-4 md:grid-cols-2">
        {db.departments.map((d) => {
          const count = db.students.filter(
            (s) => s.departmentId === d.id && s.status === "active"
          ).length
          return (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <School className="size-4 text-primary" /> {d.name}
                  </span>
                  <Badge variant="secondary">Code {d.code}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Users className="size-3.5" /> {count} active student{count === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <details className="group rounded-lg border border-border">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground select-none group-open:text-foreground [&::-webkit-details-marker]:hidden">
                    <PencilIcon />
                    Edit
                    <X className="ml-auto hidden size-4 group-open:block" />
                  </summary>
                  <form
                    action={updateDepartmentAction}
                    className="grid gap-3 border-t border-border p-3 sm:grid-cols-[1fr_100px_90px_auto]"
                  >
                    <input type="hidden" name="id" value={d.id} />
                    <input name="name" required defaultValue={d.name} className={inputClass} aria-label="Full name" />
                    <input name="short" required defaultValue={d.short} className={inputClass} aria-label="Short name" />
                    <input
                      name="code"
                      required
                      type="number"
                      min={1}
                      defaultValue={d.code}
                      className={inputClass}
                      aria-label="Code"
                    />
                    <SubmitButton pendingText="Saving…">Save</SubmitButton>
                  </form>
                </details>
                <form action={deleteDepartmentAction} className="flex justify-end">
                  <input type="hidden" name="id" value={d.id} />
                  <ConfirmSubmit
                    message={`Delete ${d.name}? Its students will be moved to another technology.`}
                  >
                    <Trash2 /> Delete
                  </ConfirmSubmit>
                </form>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
