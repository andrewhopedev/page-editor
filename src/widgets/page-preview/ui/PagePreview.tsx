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
  { value: "desktop", label: "Десктоп", size: 1280, Icon: MonitorIcon },
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
        <div>
          <Button variant="outline" size="sm" onClick={close}>
            <ArrowLeftIcon />
            Вернуться в редактор
          </Button>
        </div>

        <div className={styles.widths}>
          <ToggleGroup
            aria-label="Ширина предпросмотра"
            value={[width]}
            onValueChange={(value) => {
              const option = WIDTH_OPTIONS.find(
                (item) => item.value === value[0]
              )

              if (option) {
                setWidth(option.value)
              }
            }}
          >
            {WIDTH_OPTIONS.map(({ value, label, Icon }) => (
              <ToggleGroupItem
                key={value}
                value={value}
                size="sm"
                variant="outline"
              >
                <Icon />
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className={styles.size}>{current?.size} px</span>
        </div>

        <span aria-live="polite" className={styles.status}>
          {SAVE_STATUS_LABEL[status]}
        </span>
      </header>

      <div className={styles.viewport}>
        <div className={styles.frame} style={{ maxWidth: current?.size }}>
          <div className={styles.page}>
            <PageCanvas blocks={blocks} />
          </div>
        </div>
      </div>
    </div>
  )
}
