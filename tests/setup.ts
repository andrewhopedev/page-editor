import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

import { mockServer } from "@/entities/page-document"
import { useSelectionStore } from "@/features/block-selection"
import { useConflictDialogStore } from "@/features/conflict-resolution"
import { usePreviewModeStore } from "@/features/preview-mode"
import { DRAFT_STORAGE_KEY } from "@/shared/config"
import { removeStorage } from "@/shared/lib/storage"

afterEach(() => {
  cleanup()
  mockServer.reset()
  removeStorage(DRAFT_STORAGE_KEY)
  useSelectionStore.setState({ selectedId: null })
  useConflictDialogStore.setState({ isOpen: false })
  usePreviewModeStore.setState({ isOpen: false, width: "desktop" })
})
