import { BLOCK_TYPE_LABEL, type PageBlock } from "@/entities/page-block"
import { selectBlocks, useDocumentStore } from "@/entities/page-document"
import { updateBlock } from "@/features/block-editing"
import { useSelectionStore } from "@/features/block-selection"
import { assertNever } from "@/shared/lib/assertNever"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"

import { Field } from "./Field"
import { LayoutFields } from "./LayoutFields"
import { endEditingSeries } from "./endEditingSeries"
import styles from "./inspector.module.scss"

function TypeFields({ block }: { block: PageBlock }) {
  switch (block.type) {
    case "text":
      return (
        <Field label="Текст">
          <Textarea
            rows={6}
            value={block.text}
            onChange={(event) => {
              updateBlock(
                { ...block, text: event.target.value },
                `${block.id}:text`
              )
            }}
            onBlur={endEditingSeries}
          />
        </Field>
      )
    case "image":
      return (
        <>
          <Field label="Адрес изображения">
            <Input
              value={block.url}
              placeholder="https://"
              onChange={(event) => {
                updateBlock(
                  { ...block, url: event.target.value },
                  `${block.id}:url`
                )
              }}
              onBlur={endEditingSeries}
            />
          </Field>
          <Field label="Описание изображения">
            <Input
              value={block.alt}
              onChange={(event) => {
                updateBlock(
                  { ...block, alt: event.target.value },
                  `${block.id}:alt`
                )
              }}
              onBlur={endEditingSeries}
            />
          </Field>
        </>
      )
    case "button":
      return (
        <>
          <Field label="Подпись">
            <Input
              value={block.label}
              onChange={(event) => {
                updateBlock(
                  { ...block, label: event.target.value },
                  `${block.id}:label`
                )
              }}
              onBlur={endEditingSeries}
            />
          </Field>
          <Field label="Ссылка">
            <Input
              value={block.href}
              placeholder="https://"
              onChange={(event) => {
                updateBlock(
                  { ...block, href: event.target.value },
                  `${block.id}:href`
                )
              }}
              onBlur={endEditingSeries}
            />
          </Field>
        </>
      )
    default:
      return assertNever(block)
  }
}

export function BlockInspector() {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const blocks = useDocumentStore(selectBlocks)
  const block = blocks.find((item) => item.id === selectedId)

  if (!block) {
    return (
      <aside className={styles.blank}>
        <p className={styles.hint}>
          Выберите блок, чтобы изменить его настройки.
        </p>
      </aside>
    )
  }

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>{BLOCK_TYPE_LABEL[block.type]}</h2>

      <TypeFields block={block} />
      <LayoutFields block={block} />
    </aside>
  )
}
