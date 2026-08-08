import { create } from "zustand"

export type PreviewWidth = "desktop" | "tablet"

interface PreviewModeState {
  isOpen: boolean
  width: PreviewWidth
  open(): void
  close(): void
  setWidth(width: PreviewWidth): void
}

export const usePreviewModeStore = create<PreviewModeState>((set) => ({
  isOpen: false,
  width: "desktop",

  open() {
    set({ isOpen: true })
  },

  close() {
    set({ isOpen: false })
  },

  setWidth(width) {
    set({ width })
  },
}))
