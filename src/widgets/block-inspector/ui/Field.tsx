import type { ReactNode } from "react"

import styles from "./inspector.module.scss"

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.caption}>{label}</span>
      {children}
    </label>
  )
}
