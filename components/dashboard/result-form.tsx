"use client"

import { useState } from "react"

import { createResultAction } from "@/app/actions/results"
import { SubmitButton } from "@/components/submit-button"
import { Field, inputClass, selectClass } from "@/components/form-fields"
import { Button } from "@/components/ui/button"
import { gradeFor, SEMESTERS } from "@/lib/grading"

type Row = { name: string; marks: string }

export function ResultForm({ students }: { students: Array<{ id: string; label: string }> }) {
  const [rows, setRows] = useState<Row[]>([
    { name: "", marks: "" },
    { name: "", marks: "" },
    { name: "", marks: "" },
  ])

  const numeric = rows.map((r) => Number(r.marks))
  const validGpa =
    rows.length > 0 && numeric.every((n) => Number.isFinite(n) && n >= 0 && n <= 100)
      ? Math.round(
          (numeric.reduce((sum, n) => sum + gradeFor(n).point, 0) / rows.length) * 100
        ) / 100
      : null

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  return (
    <form action={createResultAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Student" required>
          <select name="studentId" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select student…
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Semester" required>
          <select name="semester" required defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select semester…
            </option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Subjects</p>
          <p className="text-sm text-muted-foreground">
            GPA{" "}
            <span className="font-semibold text-foreground">
              {validGpa === null ? "—" : validGpa.toFixed(2)}
            </span>{" "}
            (auto)
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_110px_auto] items-center gap-2">
              <input
                value={row.name}
                onChange={(e) => update(i, { name: e.target.value })}
                name="subjectName"
                required={i === 0}
                placeholder={`Subject ${i + 1} name`}
                className={inputClass}
              />
              <input
                value={row.marks}
                onChange={(e) => update(i, { marks: e.target.value })}
                name="subjectMarks"
                required={i === 0}
                type="number"
                min={0}
                max={100}
                placeholder="Marks"
                className={inputClass}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove subject"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={rows.length <= 1}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setRows((prev) => [...prev, { name: "", marks: "" }])}
        >
          + Add subject
        </Button>
      </div>

      <div>
        <SubmitButton pendingText="Publishing…">Publish result</SubmitButton>
      </div>
    </form>
  )
}
