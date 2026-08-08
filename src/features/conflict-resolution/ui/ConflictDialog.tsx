import { useEffect, type ReactNode } from "react"

import {
  BLOCK_TYPE_LABEL,
  diffBlocks,
  type BlockDiffEntry,
  type BlockDiffStatus,
  type PageBlock,
} from "@/entities/page-block"
import {
  selectBlocks,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { assertNever } from "@/shared/lib/assertNever"
import { cn } from "@/shared/lib/cn"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"

import { useConflictDialogStore } from "../model/conflictDialogStore"
import {
  acceptServerVersion,
  overwriteWithLocalVersion,
} from "../model/resolveConflict"

import styles from "./ConflictDialog.module.scss"

const DIFF_LABEL: Record<BlockDiffStatus, string> = {
  same: "",
  changed: "изменён",
  added: "только здесь",
  moved: "переставлен",
}

const DIFF_ROW: Record<BlockDiffStatus, string> = {
  same: "",
  changed: styles.changed,
  added: styles.added,
  moved: styles.moved,
}

const DIFF_BADGE: Record<BlockDiffStatus, string> = {
  same: "",
  changed: styles.badgeChanged,
  added: styles.badgeAdded,
  moved: styles.badgeMoved,
}

function summarize(block: PageBlock): string {
  switch (block.type) {
    case "text":
      return block.text
    case "image":
      return block.alt || block.url || "изображение не выбрано"
    case "button":
      return `${block.label} — ${block.href}`
    default:
      return assertNever(block)
  }
}

function VersionColumn({
  title,
  version,
  entries,
  action,
}: {
  title: string
  version: string
  entries: BlockDiffEntry[]
  action: ReactNode
}) {
  return (
    <section className={styles.column}>
      <header className={styles.columnHead}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <Badge variant="outline">{version}</Badge>
      </header>

      {entries.length === 0 ? (
        <p className={styles.empty}>Блоков нет</p>
      ) : (
        <ol className={styles.list}>
          {entries.map(({ block, status }) => (
            <li key={block.id} className={cn(styles.row, DIFF_ROW[status])}>
              <span className={styles.rowHead}>
                <span className={styles.rowType}>
                  {BLOCK_TYPE_LABEL[block.type]}
                </span>
                {status !== "same" && (
                  <Badge variant="outline" className={DIFF_BADGE[status]}>
                    {DIFF_LABEL[status]}
                  </Badge>
                )}
              </span>
              <span className={styles.summary}>{summarize(block)}</span>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.action}>{action}</div>
    </section>
  )
}

export function ConflictDialog() {
  const conflict = useSyncStore((state) => state.conflict)
  const baseVersion = useSyncStore((state) => state.baseVersion)
  const localBlocks = useDocumentStore(selectBlocks)
  const isOpen = useConflictDialogStore((state) => state.isOpen)
  const open = useConflictDialogStore((state) => state.open)
  const close = useConflictDialogStore((state) => state.close)

  useEffect(() => {
    if (conflict !== null) {
      open()
    }
  }, [conflict, open])

  if (conflict === null) {
    return null
  }

  const diff = diffBlocks(localBlocks, conflict.server.blocks)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close()
        }
      }}
    >
      <DialogContent className={styles.content} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Документ изменился на сервере</DialogTitle>
          <DialogDescription>
            Выберите, какую версию оставить. Пока выбор не сделан, страницу
            можно править, но она не сохраняется.
          </DialogDescription>
        </DialogHeader>

        <div className={styles.columns}>
          <VersionColumn
            title="Ваша версия"
            version={`на основе ${baseVersion}`}
            entries={diff.local}
            action={
              <Button
                className={styles.fullWidth}
                onClick={() => {
                  overwriteWithLocalVersion()
                  close()
                }}
              >
                Оставить свою
              </Button>
            }
          />
          <VersionColumn
            title="Версия на сервере"
            version={`версия ${conflict.server.version}`}
            entries={diff.server}
            action={
              <Button
                variant="outline"
                className={styles.fullWidth}
                onClick={() => {
                  acceptServerVersion()
                  close()
                }}
              >
                Принять серверную
              </Button>
            }
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
