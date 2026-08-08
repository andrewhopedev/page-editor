import type { ReactNode } from "react"

import { Label } from "@/shared/ui/label"

import styles from "./inspector.module.scss"

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <Label className={styles.field}>
      <span className={styles.caption}>{label}</span>
      {children}
    </Label>
  )
}
