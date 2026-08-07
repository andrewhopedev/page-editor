import type { PageBlock } from "../../model/types"
import { BlockRenderer } from "../BlockRenderer/BlockRenderer"

import styles from "./PageCanvas.module.scss"

interface PageCanvasProps {
  blocks: PageBlock[]
}

export function PageCanvas({ blocks }: PageCanvasProps) {
  return (
    <div className={styles.canvas}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}
