import { ImageIcon, MousePointerClickIcon, TypeIcon } from "lucide-react"

import { BLOCK_TYPE_LABEL, type PageBlockType } from "@/entities/page-block"
import { addBlock } from "@/features/block-editing"
import { useSelectionStore } from "@/features/block-selection"
import { Button } from "@/shared/ui/button"

import styles from "./BlockPalette.module.scss"

const PALETTE: { type: PageBlockType; Icon: typeof TypeIcon }[] = [
  { type: "text", Icon: TypeIcon },
  { type: "image", Icon: ImageIcon },
  { type: "button", Icon: MousePointerClickIcon },
]

export function BlockPalette() {
  const select = useSelectionStore((state) => state.select)

  return (
    <aside className={styles.palette}>
      <h2 className={styles.title}>Добавить блок</h2>

      {PALETTE.map(({ type, Icon }) => (
        <Button
          key={type}
          variant="outline"
          className={styles.item}
          onClick={() => {
            select(addBlock(type).id)
          }}
        >
          <Icon />
          {BLOCK_TYPE_LABEL[type]}
        </Button>
      ))}
    </aside>
  )
}
