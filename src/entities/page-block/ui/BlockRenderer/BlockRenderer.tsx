import { assertNever } from "@/shared/lib/assertNever"

import type { PageBlock } from "../../model/types"
import { ButtonBlock } from "../ButtonBlock/ButtonBlock"
import { ImageBlock } from "../ImageBlock/ImageBlock"
import { TextBlock } from "../TextBlock/TextBlock"

interface BlockRendererProps {
  block: PageBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return <TextBlock text={block.text} layout={block.layout} />
    case "image":
      return (
        <ImageBlock url={block.url} alt={block.alt} layout={block.layout} />
      )
    case "button":
      return (
        <ButtonBlock
          label={block.label}
          href={block.href}
          layout={block.layout}
        />
      )
    default:
      return assertNever(block)
  }
}
