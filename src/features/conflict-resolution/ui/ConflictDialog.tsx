import { useEffect } from "react"

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

function BlockDiffList({
  title,
  entries,
}: {
  title: string
  entries: BlockDiffEntry[]
}) {
  return (
    <section className={styles.side}>
      <h3 className={styles.sideTitle}>{title}</h3>

      {entries.length === 0 ? (
        <p className={styles.empty}>Блоков нет</p>
      ) : (
        <ol className={styles.list}>
          {entries.map(({ block, status }) => (
            <li
              key={block.id}
              className={cn(styles.row, status !== "same" && styles.changed)}
            >
              <span className={styles.head}>
                {BLOCK_TYPE_LABEL[block.type]}
                <span className={styles.status}>{DIFF_LABEL[status]}</span>
              </span>
              <span className={styles.summary}>{summarize(block)}</span>
            </li>
          ))}
        </ol>
      )}
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
          <BlockDiffList
            title={`Ваша версия, на основе ${baseVersion}`}
            entries={diff.local}
          />
          <BlockDiffList
            title={`Версия на сервере, ${conflict.server.version}`}
            entries={diff.server}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Закрыть
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              acceptServerVersion()
              close()
            }}
          >
            Принять серверную
          </Button>
          <Button
            onClick={() => {
              overwriteWithLocalVersion()
              close()
            }}
          >
            Перезаписать своей
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
