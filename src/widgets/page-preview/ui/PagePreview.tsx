import { ArrowLeftIcon, MonitorIcon, TabletIcon } from "lucide-react"

import { PageCanvas } from "@/entities/page-block"
import {
  SAVE_STATUS_LABEL,
  selectBlocks,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { usePreviewModeStore, type PreviewWidth } from "@/features/preview-mode"
import { Button } from "@/shared/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"

import styles from "./PagePreview.module.scss"

const WIDTH_OPTIONS: {
  value: PreviewWidth
  label: string
  size: number
  Icon: typeof MonitorIcon
}[] = [
  { value: "desktop", label: "Десктоп", size: 1080, Icon: MonitorIcon },
  { value: "tablet", label: "Планшет", size: 768, Icon: TabletIcon },
]

export function PagePreview() {
  const blocks = useDocumentStore(selectBlocks)
  const status = useSyncStore((state) => state.status)
  const width = usePreviewModeStore((state) => state.width)
  const setWidth = usePreviewModeStore((state) => state.setWidth)
  const close = usePreviewModeStore((state) => state.close)
  const current = WIDTH_OPTIONS.find((option) => option.value === width)

  return (
    <div className={styles.preview}>
      <header className={styles.header}>
        <Button variant="outline" onClick={close}>
          <ArrowLeftIcon />
          Вернуться в редактор
        </Button>

        <ToggleGroup
          aria-label="Ширина предпросмотра"
          value={[width]}
          onValueChange={(value) => {
            const option = WIDTH_OPTIONS.find((item) => item.value === value[0])

            if (option) {
              setWidth(option.value)
            }
          }}
        >
          {WIDTH_OPTIONS.map(({ value, label, Icon }) => (
            <ToggleGroupItem key={value} value={value} variant="outline">
              <Icon />
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <span aria-live="polite" className={styles.status}>
          {SAVE_STATUS_LABEL[status]}
        </span>
      </header>

      <div className={styles.viewport}>
        <div className={styles.page} style={{ maxWidth: current?.size }}>
          <PageCanvas blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
