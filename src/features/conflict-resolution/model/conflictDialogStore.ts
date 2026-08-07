import { create } from "zustand"

interface ConflictDialogState {
  isOpen: boolean
  open(): void
  close(): void
}

export const useConflictDialogStore = create<ConflictDialogState>((set) => ({
  isOpen: false,

  open() {
    set({ isOpen: true })
  },

  close() {
    set({ isOpen: false })
  },
}))
