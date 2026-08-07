import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/cn"

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
      className={cn(
        "flex items-stretch",
        isDragging && "z-10 opacity-60",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="flex cursor-grab touch-none items-center rounded-l-lg px-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">{children}</div>
    </li>
  )
}
