import { create } from "zustand"

import { useDocumentStore } from "@/entities/page-document"

interface SelectionState {
  selectedId: string | null
  select(id: string | null): void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,

  select(id) {
    useDocumentStore.getState().breakMerge()
    set({ selectedId: id })
  },
}))
