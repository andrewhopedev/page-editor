import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

import styles from "./SortableBlockCard.module.scss"

interface SortableBlockCardProps {
  id: string
  className?: string
  children: ReactNode
}

export function SortableBlockCard({
  id,
  className,
  children,
}: SortableBlockCardProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(styles.row, isDragging && styles.dragging, className)}
    >
      <span aria-hidden="true" className={styles.grip} {...listeners}>
        <GripVerticalIcon className={styles.icon} />
      </span>

      <div className={styles.content}>{children}</div>
    </li>
  )
}
