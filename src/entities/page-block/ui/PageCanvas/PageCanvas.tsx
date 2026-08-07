import { cn } from "@/shared/lib/cn"

import type { PageBlock } from "../../model/types"
import { BlockRenderer } from "../BlockRenderer/BlockRenderer"

import styles from "./PageCanvas.module.scss"

interface PageCanvasProps {
  blocks: PageBlock[]
  compact?: boolean
}

export function PageCanvas({ blocks, compact = false }: PageCanvasProps) {
  return (
    <div className={cn(styles.canvas, compact && styles.compact)}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}
