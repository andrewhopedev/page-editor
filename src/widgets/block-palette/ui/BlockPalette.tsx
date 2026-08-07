import { ImageIcon, MousePointerClickIcon, TypeIcon } from "lucide-react"

import { BLOCK_TYPE_LABEL, type PageBlockType } from "@/entities/page-block"
import { addBlock } from "@/features/block-editing"
import { useSelectionStore } from "@/features/block-selection"

import styles from "./BlockPalette.module.scss"

const PALETTE: { type: PageBlockType; hint: string; Icon: typeof TypeIcon }[] =
  [
    { type: "text", hint: "Абзац или заголовок", Icon: TypeIcon },
    { type: "image", hint: "Картинка по ссылке", Icon: ImageIcon },
    { type: "button", hint: "Кнопка со ссылкой", Icon: MousePointerClickIcon },
  ]

export function BlockPalette() {
  const select = useSelectionStore((state) => state.select)

  return (
    <aside className={styles.palette}>
      <h2 className={styles.title}>Добавить блок</h2>

      {PALETTE.map(({ type, hint, Icon }) => (
        <button
          key={type}
          type="button"
          className={styles.item}
          onClick={() => {
            select(addBlock(type).id)
          }}
        >
          <span className={styles.icon}>
            <Icon size={16} />
          </span>
          <span className={styles.label}>
            <span className={styles.name}>{BLOCK_TYPE_LABEL[type]}</span>
            <span className={styles.hint}>{hint}</span>
          </span>
        </button>
      ))}
    </aside>
  )
}
