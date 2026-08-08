import { uid } from "@/shared/lib/uid"

import type { PageBlock } from "../model/types"

export function duplicateBlock(block: PageBlock): PageBlock {
  return { ...block, id: uid("blk"), layout: { ...block.layout } }
}
