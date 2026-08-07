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
 * Движок живёт вне React и держит два инварианта.
 *
 * Первый: на документ одновременно выполняется только один запрос - флаг
 * inFlight. Накопившиеся за время запроса правки уходят сразу после ответа, без
 * повторного ожидания дебаунса: 700мс уже отработали
 *
 * Второй: ответ никогда не перезаписывает локальные блоки. Сохранённой
 * считается отправленная ревизия, а не текущая, поэтому набранное во время
 * запроса остаётся грязным и уедет следующим запросом
 *
 * Конфликт замораживает цикл: до решения пользователя новые запросы не уходят,
 * иначе сервер будет отвечать 409 бесконечно. Ошибка цикл останавливает -
 * автоповтора нет, повтор запускает пользователь через flush
 */
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
    const document = useDocumentStore.getState()

    if (inFlight || sync.conflict !== null) {
      return
    }

    if (document.revision === sync.savedRevision) {
      return
    }

    const sentRevision = document.revision
    const blocks = selectBlocks(document)
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

      if (useSyncStore.getState().status === "saved") {
        removeDraft()
      }
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
      return useDocumentStore.subscribe((state, previous) => {
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
    },

    flush() {
      cancelTimer()
      void run()
    },
  }
}
