import { cn } from "@/lib/utils"

/**
 * Form helpers shared by the dashboard forms.
 * These are plain (server-component-safe) styled elements.
 */

export const inputClass = cn(
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors outline-none",
  "placeholder:text-muted-foreground",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "dark:bg-input/30"
)

export const selectClass = cn(
  inputClass,
  "bg-no-repeat pr-8",
  // Dark mode: make the native dropdown options readable (they inherit the
  // select's colors otherwise and turn invisible on the white popup).
  "[&>option]:bg-card [&>option]:text-card-foreground",
  "dark:bg-input/30"
)

export function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

/** Section wrapper used inside forms. */
export function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="rounded-xl border border-border p-4">
      <legend className="px-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </legend>
      <div className="grid gap-4 pt-1 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}
