import { Megaphone, Paperclip, Pin, Plus, Trash2, TriangleAlert } from "lucide-react"

import {
  createNoticeAction,
  deleteNoticeAction,
  updateNoticeAction,
} from "@/app/actions/notices"
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
export const metadata = { title: "Notices" }

const ERRORS: Record<string, string> = {
  missing: "Title and body are both required.",
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string
    created?: string
    saved?: string
    deleted?: string
    edit?: string
  }>
}) {
  const flags = await searchParams
  const db = await readDb()

  const editing = flags.edit ? db.notices.find((n) => n.id === flags.edit) : undefined

  const message = flags.error
    ? { kind: "error", text: ERRORS[flags.error] ?? "Something went wrong." }
    : flags.created
      ? { kind: "ok", text: "Notice published — it is now visible on the website." }
      : flags.saved
        ? { kind: "ok", text: "Notice updated." }
        : flags.deleted
          ? { kind: "ok", text: "Notice deleted." }
          : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Notices</h1>
        <p className="text-sm text-muted-foreground">
          Notices published here appear on the public website&apos;s notice board.
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
          {message.kind === "error" ? <TriangleAlert className="size-4" /> : null}
          {message.text}
        </p>
      ) : null}

      {/* Create / edit notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editing ? <Paperclip className="size-4 text-primary" /> : <Plus className="size-4 text-primary" />}
            {editing ? "Edit notice" : "Publish a new notice"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={editing ? updateNoticeAction : createNoticeAction}
            className="flex flex-col gap-4"
          >
            {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
            <Field label="Title" required>
              <input
                name="title"
                required
                defaultValue={editing?.title ?? ""}
                placeholder="e.g. Semester final exam routine published"
                className={inputClass}
              />
            </Field>
            <Field label="Details" required>
              <textarea
                name="body"
                required
                rows={4}
                defaultValue={editing?.body ?? ""}
                placeholder="Write the full notice here…"
                className={`${inputClass} h-auto py-2`}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="pinned"
                defaultChecked={editing?.pinned ?? false}
                className="size-4 accent-(--primary)"
              />
              Pin to top of the notice board
            </label>
            <div className="flex gap-3">
              <SubmitButton pendingText="Publishing…">
                {editing ? "Save changes" : "Publish notice"}
              </SubmitButton>
              {editing ? (
                <a
                  href="/dashboard/notices"
                  className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
                >
                  Cancel edit
                </a>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="flex flex-col gap-4">
        {db.notices
          .slice()
          .sort((a, b) =>
            a.pinned === b.pinned ? b.date.localeCompare(a.date) : a.pinned ? -1 : 1
          )
          .map((n) => (
            <Card key={n.id} size="sm">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {n.pinned ? (
                    <Badgeish>
                      <Pin className="size-3" /> Pinned
                    </Badgeish>
                  ) : null}
                  {n.title}
                </CardTitle>
                <CardDescription>
                  {new Date(n.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <div className="flex items-center justify-end gap-1">
                  <a
                    href={`/dashboard/notices?edit=${n.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Megaphone className="size-4" /> Edit
                  </a>
                  <form action={deleteNoticeAction} className="inline-flex">
                    <input type="hidden" name="id" value={n.id} />
                    <ConfirmSubmit message={`Delete the notice “${n.title}”?`}>
                      <Trash2 className="size-4" /> Delete
                    </ConfirmSubmit>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

function Badgeish({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center gap-1 rounded-4xl bg-primary px-2 text-xs font-medium whitespace-nowrap text-primary-foreground">
      {children}
    </span>
  )
}
