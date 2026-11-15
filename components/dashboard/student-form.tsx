import { createStudentAction, updateStudentAction } from "@/app/actions/students"
import { SubmitButton } from "@/components/submit-button"
import { Field, FormSection, inputClass, selectClass } from "@/components/form-fields"
import { BLOOD_GROUPS, SEMESTERS } from "@/lib/grading"
import type { Department, Student } from "@/lib/types"

/**
 * Shared student form. Used by both the "add student" page and the
 * "edit student" page (mode: create | edit).
 */
export function StudentForm({
  mode,
  departments,
  student,
}: {
  mode: "create" | "edit"
  departments: Department[]
  student?: Student
}) {
  const action =
    mode === "create" ? createStudentAction : updateStudentAction

  return (
    <form action={action} className="flex flex-col gap-5">
      {student ? <input type="hidden" name="id" value={student.id} /> : null}

      <FormSection title="Student information">
        <Field label="Full name" required>
          <input
            name="name"
            required
            defaultValue={student?.name ?? ""}
            placeholder="e.g. Ayesha Siddika"
            className={inputClass}
          />
        </Field>
        <Field label="Roll number" required hint="Must be unique, e.g. 672401">
          <input
            name="roll"
            required
            defaultValue={student?.roll ?? ""}
            placeholder="e.g. 672401"
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            defaultValue={student?.email ?? ""}
            placeholder="student@example.com"
            className={inputClass}
          />
        </Field>
        <Field label="Mobile number">
          <input
            name="phone"
            defaultValue={student?.phone ?? ""}
            placeholder="01XXXXXXXXX"
            className={inputClass}
          />
        </Field>
        <Field label="Technology (department)" required>
          <select
            name="departmentId"
            required
            defaultValue={student?.departmentId ?? ""}
            className={selectClass}
          >
            <option value="" disabled>
              Select technology…
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.short})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Semester" required>
          <select
            name="semester"
            required
            defaultValue={student?.semester ?? 1}
            className={selectClass}
          >
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shift" required>
          <select
            name="shift"
            required
            defaultValue={student?.shift ?? "1st"}
            className={selectClass}
          >
            <option value="1st">1st shift</option>
            <option value="2nd">2nd shift</option>
          </select>
        </Field>
        <Field label="Session" required hint="e.g. 2024-25">
          <input
            name="session"
            required
            defaultValue={student?.session ?? ""}
            placeholder="e.g. 2024-25"
            className={inputClass}
          />
        </Field>
        <Field label="Date of birth">
          <input
            name="dob"
            type="date"
            defaultValue={student?.dob ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Blood group">
          <select
            name="bloodGroup"
            defaultValue={student?.bloodGroup ?? ""}
            className={selectClass}
          >
            <option value="">Unknown</option>
            {BLOOD_GROUPS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        {mode === "edit" ? (
          <Field label="Status">
            <select
              name="status"
              defaultValue={student?.status ?? "active"}
              className={selectClass}
            >
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
          </Field>
        ) : null}
      </FormSection>

      <FormSection title="Guardian & address">
        <Field label="Guardian name">
          <input
            name="guardianName"
            defaultValue={student?.guardianName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Guardian mobile">
          <input
            name="guardianPhone"
            defaultValue={student?.guardianPhone ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <textarea
            name="address"
            rows={2}
            defaultValue={student?.address ?? ""}
            className={`${inputClass} h-auto py-2`}
          />
        </Field>
      </FormSection>

      <div className="flex gap-3">
        <SubmitButton pendingText="Saving…">
          {mode === "create" ? "Add student" : "Save changes"}
        </SubmitButton>
        <a
          href={student ? `/dashboard/students/${student.id}` : "/dashboard/students"}
          className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
