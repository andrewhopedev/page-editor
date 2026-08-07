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
    <div className="flex h-svh flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-2">
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

        <span
          aria-live="polite"
          className="ml-auto text-sm text-muted-foreground"
        >
          {SAVE_STATUS_LABEL[status]}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted p-6">
        <div
          className="mx-auto rounded-lg bg-white px-6 shadow-sm"
          style={{ maxWidth: current?.size }}
        >
          <PageCanvas blocks={blocks} />
        </div>
      </div>
    </div>
  )
}
