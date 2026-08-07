import type { ReactNode } from "react"

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
