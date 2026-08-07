import { EyeIcon, Redo2Icon, Undo2Icon } from "lucide-react"

import {
  SAVE_STATUS_LABEL,
  selectCanRedo,
  selectCanUndo,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { usePreviewModeStore } from "@/features/preview-mode"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"

export function EditorToolbar() {
  const canUndo = useDocumentStore(selectCanUndo)
  const canRedo = useDocumentStore(selectCanRedo)
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const status = useSyncStore((state) => state.status)
  const openPreview = usePreviewModeStore((state) => state.open)

  return (
    <header className="flex items-center gap-2 border-b px-4 py-2">
      <span className="mr-2 text-sm font-medium">Редактор страницы</span>

      <Button
        variant="outline"
        size="icon"
        aria-label="Отменить"
        disabled={!canUndo}
        onClick={undo}
      >
        <Undo2Icon />
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Повторить"
        disabled={!canRedo}
        onClick={redo}
      >
        <Redo2Icon />
      </Button>

      <Separator orientation="vertical" className="mx-2 h-5" />

      <span aria-live="polite" className="text-sm text-muted-foreground">
        {SAVE_STATUS_LABEL[status]}
      </span>

      <Button variant="outline" className="ml-auto" onClick={openPreview}>
        <EyeIcon />
        Предпросмотр
      </Button>
    </header>
  )
}
