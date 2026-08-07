import { CopyIcon, Trash2Icon } from "lucide-react"

import {
  BLOCK_TYPE_LABEL,
  PageCanvas,
  type PageBlock,
} from "@/entities/page-block"
import { duplicateBlock, removeBlock } from "@/features/block-editing"
import { useSelectionStore } from "@/features/block-selection"
import { Button } from "@/shared/ui/button"

import styles from "./BlockCard.module.scss"

interface BlockCardProps {
  block: PageBlock
  position: number
}

export function BlockCard({ block, position }: BlockCardProps) {
  const select = useSelectionStore((state) => state.select)

  return (
    <>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.name}
          onClick={() => {
            select(block.id)
          }}
        >
          <span className={styles.position}>{position}. </span>
          {BLOCK_TYPE_LABEL[block.type]}
        </button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Дублировать блок"
          onClick={() => {
            const copy = duplicateBlock(block.id)

            if (copy) {
              select(copy.id)
            }
          }}
        >
          <CopyIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Удалить блок"
          onClick={() => {
            removeBlock(block.id)
          }}
        >
          <Trash2Icon />
        </Button>
      </div>

      <div
        role="presentation"
        className={styles.preview}
        onClick={() => {
          select(block.id)
        }}
      >
        <div inert>
          <PageCanvas blocks={[block]} />
        </div>
      </div>
    </>
  )
}
