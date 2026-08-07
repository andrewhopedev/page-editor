import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

import { mockServer } from "@/entities/page-document"
import { useSelectionStore } from "@/features/block-selection"
import { usePreviewModeStore } from "@/features/preview-mode"

afterEach(() => {
  cleanup()
  mockServer.reset()
  useSelectionStore.setState({ selectedId: null })
  usePreviewModeStore.setState({ isOpen: false, width: "desktop" })
})
