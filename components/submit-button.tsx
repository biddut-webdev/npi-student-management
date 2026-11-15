"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

/**
 * Submit button that automatically shows a pending state
 * while its enclosing server action is running.
 */
export function SubmitButton({
  children,
  className,
  variant,
  size,
  pendingText,
}: {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  pendingText?: string
}) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className={className}
      variant={variant}
      size={size}
    >
      {pending ? (pendingText ?? "Saving…") : children}
    </Button>
  )
}

/** Destructive submit button with a native confirm() prompt. */
export function ConfirmSubmit({
  children,
  message,
  name,
  value,
  className,
}: {
  children: React.ReactNode
  message: string
  name?: string
  value?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={
        className ??
        "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent px-2.5 text-sm font-medium whitespace-nowrap text-red-600 outline-none transition-all select-none hover:bg-red-500/10 disabled:pointer-events-none disabled:opacity-50 dark:text-red-400"
      }
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault()
      }}
    >
      {pending ? "Working…" : children}
    </button>
  )
}
