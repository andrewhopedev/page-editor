import type { PageBlock } from "../model/types"

import { isSameBlock } from "./isSameBlock"

export type BlockDiffStatus = "same" | "changed" | "added" | "moved"

export interface BlockDiffEntry {
  block: PageBlock
  status: BlockDiffStatus
}

export interface BlocksDiff {
  local: BlockDiffEntry[]
  server: BlockDiffEntry[]
}

interface Placed {
  block: PageBlock
  index: number
}

function placeById(blocks: PageBlock[]): Map<string, Placed> {
  return new Map(blocks.map((block, index) => [block.id, { block, index }]))
}

function markSide(side: PageBlock[], other: Map<string, Placed>) {
  return side.map((block, index): BlockDiffEntry => {
    const counterpart = other.get(block.id)

    if (counterpart === undefined) {
      return { block, status: "added" }
    }

    if (!isSameBlock(block, counterpart.block)) {
      return { block, status: "changed" }
    }

    if (counterpart.index !== index) {
      return { block, status: "moved" }
    }

    return { block, status: "same" }
  })
}

export function diffBlocks(
  local: PageBlock[],
  server: PageBlock[]
): BlocksDiff {
  const localPlaces = placeById(local)
  const serverPlaces = placeById(server)

  return {
    local: markSide(local, serverPlaces),
    server: markSide(server, localPlaces),
  }
}
