import {
  EyeIcon,
  Loader2Icon,
  PanelsTopLeftIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react"

import {
  SAVE_STATUS_LABEL,
  type SaveStatus,
  selectCanRedo,
  selectCanUndo,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { useConflictDialogStore } from "@/features/conflict-resolution"
import { documentSync } from "@/features/document-sync"
import { usePreviewModeStore } from "@/features/preview-mode"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

import styles from "./EditorToolbar.module.scss"

const STATUS_STYLE: Record<Exclude<SaveStatus, "idle">, string> = {
  dirty: styles.dirty,
  saving: styles.saving,
  saved: styles.saved,
  error: styles.error,
  conflict: styles.conflict,
}

export function EditorToolbar() {
  const canUndo = useDocumentStore(selectCanUndo)
  const canRedo = useDocumentStore(selectCanRedo)
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const status = useSyncStore((state) => state.status)
  const openPreview = usePreviewModeStore((state) => state.open)
  const openConflict = useConflictDialogStore((state) => state.open)

  return (
    <header className={styles.toolbar}>
      <span className={styles.brand}>
        <PanelsTopLeftIcon size={16} className={styles.brandIcon} />
        Редактор страницы
      </span>

      <div className={styles.group}>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Отменить"
          disabled={!canUndo}
          onClick={undo}
        >
          <Undo2Icon />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Повторить"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2Icon />
        </Button>
      </div>

      <span aria-live="polite" className={styles.status}>
        {status !== "idle" && (
          <Badge variant="outline" className={STATUS_STYLE[status]}>
            {status === "saving" && <Loader2Icon className={styles.spinner} />}
            {SAVE_STATUS_LABEL[status]}
          </Badge>
        )}
      </span>

      {status === "error" && (
        <Button variant="outline" size="sm" onClick={documentSync.flush}>
          Повторить
        </Button>
      )}

      {status === "conflict" && (
        <Button variant="outline" size="sm" onClick={openConflict}>
          Разрешить
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
