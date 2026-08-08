export type BlockAlign = "left" | "center" | "right"

export interface BlockLayout {
  align: BlockAlign
  marginTop: number
  marginBottom: number
}

export interface TextBlock {
  id: string
  type: "text"
  text: string
  layout: BlockLayout
}

export interface ImageBlock {
  id: string
  type: "image"
  url: string
  alt: string
  layout: BlockLayout
}

export interface ButtonBlock {
  id: string
  type: "button"
  label: string
  href: string
  layout: BlockLayout
}

export type PageBlock = TextBlock | ImageBlock | ButtonBlock
export type PageBlockType = PageBlock["type"]
