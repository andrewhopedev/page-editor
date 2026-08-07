import { isSameBlock, type PageBlock } from "@/entities/page-block"
import type { PageDocument } from "@/entities/page-document"
import { useDocumentStore, useSyncStore } from "@/entities/page-document"

import { readDraft, removeDraft } from "./draft"

interface LoadApi {
  getPage(): Promise<PageDocument>
}

function areBlocksEqual(a: PageBlock[], b: PageBlock[]): boolean {
  return (
    a.length === b.length &&
    a.every((block, index) => isSameBlock(block, b[index]))
  )
}

export async function bootstrapDocument(api: LoadApi): Promise<void> {
  const server = await api.getPage()
  const draft = readDraft()

  useDocumentStore.getState().initialize(server.blocks)
  useSyncStore.getState().initialize(server.version)

  if (draft === null) {
    return
  }

  if (areBlocksEqual(draft.blocks, server.blocks)) {
    removeDraft()
    return
  }

  useDocumentStore.getState().applyBlocks(draft.blocks)

  if (draft.baseVersion !== server.version) {
    useSyncStore.getState().setConflict(server)
  }
}
