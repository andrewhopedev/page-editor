import type { PageDocument, SavePageInput } from "@/entities/page-document"
import {
  selectBlocks,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { ConflictError } from "@/shared/api"
import { AUTOSAVE_DEBOUNCE_MS } from "@/shared/config"

import { removeDraft, writeDraft } from "./draft"

interface SaveApi {
  savePage(input: SavePageInput): Promise<PageDocument>
}

export interface DocumentSync {
  start(): () => void
  flush(): void
}

function conflictDocument(error: unknown): PageDocument | null {
  return error instanceof ConflictError
    ? (error.serverDocument as PageDocument)
    : null
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Не удалось сохранить страницу"
}

/**
 * Черновик всегда несёт ту версию, на которой основан. После успешного запроса
 * baseVersion вырос, и если правки к этому моменту продолжились, оставшаяся в
 * черновике старая версия превратилась бы после перезагрузки в ложный конфликт.
 */
function refreshDraftAfterSave(): void {
  const sync = useSyncStore.getState()

  if (sync.status === "saved") {
    removeDraft()
    return
  }

  writeDraft({
    blocks: selectBlocks(useDocumentStore.getState()),
    baseVersion: sync.baseVersion,
  })
}

export function createDocumentSync(api: SaveApi): DocumentSync {
  let timer: ReturnType<typeof setTimeout> | null = null
  let inFlight = false

  function cancelTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function run(): Promise<void> {
    const sync = useSyncStore.getState()
    const documentState = useDocumentStore.getState()

    if (inFlight || sync.conflict !== null) {
      return
    }

    if (documentState.revision === sync.savedRevision) {
      return
    }

    const sentRevision = documentState.revision
    const blocks = selectBlocks(documentState)
    const force = sync.consumeForce()

    inFlight = true
    sync.markSaving()

    try {
      const saved = await api.savePage({
        blocks,
        version: useSyncStore.getState().baseVersion,
        force,
      })

      useSyncStore.getState().markSaved({
        version: saved.version,
        sentRevision,
        currentRevision: useDocumentStore.getState().revision,
      })

      refreshDraftAfterSave()
    } catch (error) {
      const server = conflictDocument(error)

      if (server === null) {
        useSyncStore.getState().markError(errorMessage(error))
      } else {
        useSyncStore.getState().setConflict(server)
      }
    } finally {
      inFlight = false
    }

    const next = useSyncStore.getState()

    if (
      next.conflict === null &&
      next.status !== "error" &&
      useDocumentStore.getState().revision !== next.savedRevision
    ) {
      await run()
    }
  }

  function schedule(): void {
    cancelTimer()
    timer = setTimeout(() => {
      timer = null
      void run()
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  return {
    start() {
      const stopDocument = useDocumentStore.subscribe((state, previous) => {
        if (state.revision === previous.revision) {
          return
        }

        const sync = useSyncStore.getState()

        sync.markDirty()
        writeDraft({
          blocks: selectBlocks(state),
          baseVersion: sync.baseVersion,
        })

        if (useSyncStore.getState().conflict !== null) {
          return
        }

        schedule()
      })

      const stopSync = useSyncStore.subscribe((state, previous) => {
        if (!previous.pendingForce && state.pendingForce) {
          void run()
        }
      })

      return () => {
        stopDocument()
        stopSync()
        cancelTimer()
      }
    },

    flush() {
      cancelTimer()
      void run()
    },
  }
}
