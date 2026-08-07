import { create } from "zustand"

import type { PageDocument, SaveStatus } from "./types"

interface SavedInput {
  version: number
  sentRevision: number
  currentRevision: number
}

interface SyncState {
  status: SaveStatus
  baseVersion: number
  savedRevision: number
  error: string | null
  conflict: { server: PageDocument } | null
  pendingForce: boolean
}

interface SyncActions {
  initialize(version: number): void
  markDirty(): void
  markSaving(): void
  markSaved(input: SavedInput): void
  markError(message: string): void
  setConflict(server: PageDocument): void
  resolveWithServer(version: number, revision: number): void
  resolveWithLocal(version: number): void
  consumeForce(): boolean
}

const INITIAL_STATE: SyncState = {
  status: "idle",
  baseVersion: 0,
  savedRevision: 0,
  error: null,
  conflict: null,
  pendingForce: false,
}

export const useSyncStore = create<SyncState & SyncActions>((set, get) => ({
  ...INITIAL_STATE,

  initialize(version) {
    set({ ...INITIAL_STATE, baseVersion: version })
  },

  markDirty() {
    set((state) =>
      state.conflict === null ? { status: "dirty", error: null } : state
    )
  },

  markSaving() {
    set({ status: "saving", error: null })
  },

  /**
   * savedRevision получает отправленную ревизию, а не текущую: пока запрос был в
   * пути, пользователь мог успеть напечатать ещё, и такой документ остаётся
   * грязным. Блоки из ответа сервера не применяются — мы отправили ровно то, что
   * у нас есть, и перезапись ответом затёрла бы свежие правки.
   */
  markSaved({ version, sentRevision, currentRevision }) {
    set({
      baseVersion: version,
      savedRevision: sentRevision,
      status: currentRevision === sentRevision ? "saved" : "dirty",
      error: null,
    })
  },

  markError(message) {
    set({ status: "error", error: message })
  },

  setConflict(server) {
    set({ status: "conflict", conflict: { server }, error: null })
  },

  resolveWithServer(version, revision) {
    set({
      status: "saved",
      baseVersion: version,
      savedRevision: revision,
      conflict: null,
      error: null,
      pendingForce: false,
    })
  },

  /**
   * baseVersion обновляется на серверную до отправки: без этого следующий запрос
   * уйдёт со старой версией и сервер вернёт 409 повторно, уже с force.
   */
  resolveWithLocal(version) {
    set({
      status: "dirty",
      baseVersion: version,
      conflict: null,
      error: null,
      pendingForce: true,
    })
  },

  consumeForce() {
    const { pendingForce } = get()

    if (pendingForce) {
      set({ pendingForce: false })
    }

    return pendingForce
  },
}))
