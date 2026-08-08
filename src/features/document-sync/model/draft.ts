import type { PageBlock } from "@/entities/page-block"
import { DRAFT_STORAGE_KEY } from "@/shared/config"
import { readStorage, removeStorage, writeStorage } from "@/shared/lib/storage"

export interface Draft {
  blocks: PageBlock[]
  baseVersion: number
}

function isDraft(value: unknown): value is Draft {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Partial<Draft>

  return (
    Array.isArray(candidate.blocks) && typeof candidate.baseVersion === "number"
  )
}

export function readDraft(): Draft | null {
  const stored = readStorage<unknown>(DRAFT_STORAGE_KEY)

  return isDraft(stored) ? stored : null
}

export function writeDraft(draft: Draft): void {
  writeStorage(DRAFT_STORAGE_KEY, draft)
}

export function removeDraft(): void {
  removeStorage(DRAFT_STORAGE_KEY)
}
