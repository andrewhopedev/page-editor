import {
  createBlock,
  duplicateBlock as copyBlock,
  type PageBlock,
  type PageBlockType,
} from "@/entities/page-block"
import { selectBlocks, useDocumentStore } from "@/entities/page-document"

function currentBlocks(): PageBlock[] {
  return selectBlocks(useDocumentStore.getState())
}

function apply(next: PageBlock[], mergeKey?: string | null): void {
  useDocumentStore.getState().applyBlocks(next, mergeKey)
}

export function addBlock(type: PageBlockType): PageBlock {
  const block = createBlock(type)

  apply([...currentBlocks(), block])

  return block
}

export function updateBlock(next: PageBlock, mergeKey?: string | null): void {
  const blocks = currentBlocks()
  const index = blocks.findIndex((block) => block.id === next.id)

  if (index === -1) {
    return
  }

  const updated = [...blocks]
  updated[index] = next

  apply(updated, mergeKey)
}

export function duplicateBlock(id: string): PageBlock | null {
  const blocks = currentBlocks()
  const index = blocks.findIndex((block) => block.id === id)

  if (index === -1) {
    return null
  }

  const copy = copyBlock(blocks[index])
  const next = [...blocks]
  next.splice(index + 1, 0, copy)

  apply(next)

  return copy
}

export function removeBlock(id: string): void {
  const blocks = currentBlocks()
  const next = blocks.filter((block) => block.id !== id)

  if (next.length === blocks.length) {
    return
  }

  apply(next)
}

export function reorderBlocks(activeId: string, overId: string): void {
  const blocks = currentBlocks()
  const from = blocks.findIndex((block) => block.id === activeId)
  const to = blocks.findIndex((block) => block.id === overId)

  if (from === -1 || to === -1 || from === to) {
    return
  }

  const next = [...blocks]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)

  apply(next)
}
