import { useDocumentStore } from "@/entities/page-document"

export function endEditingSeries(): void {
  useDocumentStore.getState().breakMerge()
}
