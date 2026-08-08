import { assertNever } from "@/shared/lib/assertNever"
import { uid } from "@/shared/lib/uid"

import type { BlockLayout, PageBlock, PageBlockType } from "../model/types"

const DEFAULT_LAYOUT: BlockLayout = {
  align: "left",
  marginTop: 16,
  marginBottom: 0,
}

export function createBlock(type: PageBlockType): PageBlock {
  const id = uid("blk")
  const layout = { ...DEFAULT_LAYOUT }

  switch (type) {
    case "text":
      return { id, type, layout, text: "Новый текстовый блок" }
    case "image":
      return { id, type, layout, url: "", alt: "" }
    case "button":
      return { id, type, layout, label: "Кнопка", href: "#" }
    default:
      return assertNever(type)
  }
}
