import type { PageBlock } from "@/entities/page-block/@x/page-document"

export interface PageDocument {
  id: string
  blocks: PageBlock[]
  version: number
}

export type SaveStatus =
  "idle" | "dirty" | "saving" | "saved" | "error" | "conflict"
