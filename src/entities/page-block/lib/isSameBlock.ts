import { assertNever } from "@/shared/lib/assertNever"

import type { BlockLayout, PageBlock } from "../model/types"

function isSameLayout(a: BlockLayout, b: BlockLayout): boolean {
  return (
    a.align === b.align &&
    a.marginTop === b.marginTop &&
    a.marginBottom === b.marginBottom
  )
}

export function isSameBlock(a: PageBlock, b: PageBlock): boolean {
  if (a.id !== b.id || !isSameLayout(a.layout, b.layout)) {
    return false
  }

  switch (a.type) {
    case "text":
      return b.type === "text" && a.text === b.text
    case "image":
      return b.type === "image" && a.url === b.url && a.alt === b.alt
    case "button":
      return b.type === "button" && a.label === b.label && a.href === b.href
    default:
      return assertNever(a)
  }
}
