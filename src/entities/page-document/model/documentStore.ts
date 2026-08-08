import { create } from "zustand"

import type { PageBlock } from "@/entities/page-block/@x/page-document"
import { HISTORY_DEPTH, HISTORY_MERGE_WINDOW_MS } from "@/shared/config"
import {
  breakMerge,
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
} from "@/shared/lib/history"

interface DocumentState {
  history: History<PageBlock[]>
  revision: number
}

interface DocumentActions {
  initialize(blocks: PageBlock[]): void
  applyBlocks(next: PageBlock[], mergeKey?: string | null): void
  undo(): void
  redo(): void
  breakMerge(): void
}

/**
 * applyBlocks — единственный шов мутации документа. Любое изменение блоков
 * проходит через него, поэтому шаг истории и рост revision пропустить нельзя.
 *
 * undo и redo тоже увеличивают revision: отмена — такое же изменение документа
 * и обязана запускать автосохранение. Если откатывать нечего, revision не
 * меняется и лишнего запроса не будет.
 */
export const useDocumentStore = create<DocumentState & DocumentActions>(
  (set) => ({
    history: createHistory<PageBlock[]>([]),
    revision: 0,

    initialize(blocks) {
      set({ history: createHistory(blocks), revision: 0 })
    },

    applyBlocks(next, mergeKey = null) {
      set((state) => ({
        history: pushHistory(state.history, next, {
          mergeKey,
          now: Date.now(),
          depth: HISTORY_DEPTH,
          mergeWindowMs: HISTORY_MERGE_WINDOW_MS,
        }),
        revision: state.revision + 1,
      }))
    },

    undo() {
      set((state) => {
        const history = undoHistory(state.history)

        return history === state.history
          ? state
          : { history, revision: state.revision + 1 }
      })
    },

    redo() {
      set((state) => {
        const history = redoHistory(state.history)

        return history === state.history
          ? state
          : { history, revision: state.revision + 1 }
      })
    },

    breakMerge() {
      set((state) =>
        state.history.lastMergeKey === null
          ? state
          : { history: breakMerge(state.history) }
      )
    },
  })
)

export const selectBlocks = (state: DocumentState) => state.history.present
export const selectCanUndo = (state: DocumentState) => canUndo(state.history)
export const selectCanRedo = (state: DocumentState) => canRedo(state.history)
