import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"

import type { BlockAlign, PageBlock } from "@/entities/page-block"
import { updateBlock } from "@/features/block-editing"
import { Input } from "@/shared/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"

import { Field } from "./Field"
import { endEditingSeries } from "./endEditingSeries"
import styles from "./inspector.module.scss"

const ALIGN_OPTIONS: {
  value: BlockAlign
  label: string
  Icon: typeof AlignLeftIcon
}[] = [
  { value: "left", label: "По левому краю", Icon: AlignLeftIcon },
  { value: "center", label: "По центру", Icon: AlignCenterIcon },
  { value: "right", label: "По правому краю", Icon: AlignRightIcon },
]

function toMargin(value: number): number {
  return Number.isNaN(value) ? 0 : Math.max(0, value)
}

interface LayoutFieldsProps {
  block: PageBlock
}

export function LayoutFields({ block }: LayoutFieldsProps) {
  const { layout } = block

  return (
    <>
      <div className={styles.field}>
        <span className={styles.caption}>Выравнивание</span>
        <ToggleGroup
          aria-label="Выравнивание"
          value={[layout.align]}
          onValueChange={(value) => {
            const option = ALIGN_OPTIONS.find((item) => item.value === value[0])

            if (option) {
              updateBlock({
                ...block,
                layout: { ...layout, align: option.value },
              })
            }
          }}
        >
          {ALIGN_OPTIONS.map(({ value, label, Icon }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              variant="outline"
              aria-label={label}
            >
              <Icon />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className={styles.margins}>
        <Field label="Отступ сверху">
          <Input
            type="number"
            min={0}
            step={4}
            value={layout.marginTop}
            onChange={(event) => {
              updateBlock(
                {
                  ...block,
                  layout: {
                    ...layout,
                    marginTop: toMargin(event.target.valueAsNumber),
                  },
                },
                `${block.id}:marginTop`
              )
            }}
            onBlur={endEditingSeries}
          />
        </Field>

        <Field label="Отступ снизу">
          <Input
            type="number"
            min={0}
            step={4}
            value={layout.marginBottom}
            onChange={(event) => {
              updateBlock(
                {
                  ...block,
                  layout: {
                    ...layout,
                    marginBottom: toMargin(event.target.valueAsNumber),
                  },
                },
                `${block.id}:marginBottom`
              )
            }}
            onBlur={endEditingSeries}
          />
        </Field>
      </div>
    </>
  )
}
