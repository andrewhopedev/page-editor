import { useDocumentStore, useSyncStore } from "@/entities/page-document"

export function acceptServerVersion(): void {
  const { conflict } = useSyncStore.getState()

  if (conflict === null) {
    return
  }

  useDocumentStore.getState().applyBlocks(conflict.server.blocks)
  useSyncStore
    .getState()
    .resolveWithServer(
      conflict.server.version,
      useDocumentStore.getState().revision
    )
}

export function overwriteWithLocalVersion(): void {
  const { conflict } = useSyncStore.getState()

  if (conflict === null) {
    return
  }

  useSyncStore.getState().resolveWithLocal(conflict.server.version)
}
