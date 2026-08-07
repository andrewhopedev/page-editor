import { EyeIcon, Redo2Icon, Undo2Icon } from "lucide-react"

import {
  SAVE_STATUS_LABEL,
  selectCanRedo,
  selectCanUndo,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { documentSync } from "@/features/document-sync"
import { usePreviewModeStore } from "@/features/preview-mode"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"

import styles from "./EditorToolbar.module.scss"

export function EditorToolbar() {
  const canUndo = useDocumentStore(selectCanUndo)
  const canRedo = useDocumentStore(selectCanRedo)
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const status = useSyncStore((state) => state.status)
  const openPreview = usePreviewModeStore((state) => state.open)

  return (
    <header className={styles.toolbar}>
      <span className={styles.title}>Редактор страницы</span>

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

      <Separator orientation="vertical" className={styles.separator} />

      <span aria-live="polite" className={styles.status}>
        {SAVE_STATUS_LABEL[status]}
      </span>

      {status === "error" && (
        <Button variant="outline" size="sm" onClick={documentSync.flush}>
          Повторить
        </Button>
      )}

      <Button
        variant="outline"
        className={styles.preview}
        onClick={openPreview}
      >
        <EyeIcon />
        Предпросмотр
      </Button>
    </header>
  )
}
