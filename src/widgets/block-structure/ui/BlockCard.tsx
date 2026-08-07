import { CopyIcon, Trash2Icon } from "lucide-react"

import {
  BLOCK_TYPE_LABEL,
  PageCanvas,
  type PageBlock,
} from "@/entities/page-block"
import { duplicateBlock, removeBlock } from "@/features/block-editing"
import { useSelectionStore } from "@/features/block-selection"
import { Button } from "@/shared/ui/button"

interface BlockCardProps {
  block: PageBlock
  position: number
}

export function BlockCard({ block, position }: BlockCardProps) {
  const select = useSelectionStore((state) => state.select)

  return (
    <>
      <div className="flex items-center gap-1 pt-2 pr-2">
        <button
          type="button"
          className="flex-1 truncate rounded px-1 py-0.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => {
            select(block.id)
          }}
        >
          <span className="text-muted-foreground">{position}. </span>
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
        className="mt-2 mr-2 mb-2 max-h-32 overflow-hidden rounded-md border px-3"
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
