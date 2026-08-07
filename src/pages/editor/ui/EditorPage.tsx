import { useHistoryHotkeys } from "@/features/history-navigation"
import { usePreviewModeStore } from "@/features/preview-mode"
import { BlockInspector } from "@/widgets/block-inspector"
import { BlockPalette } from "@/widgets/block-palette"
import { BlockStructure } from "@/widgets/block-structure"
import { EditorToolbar } from "@/widgets/editor-toolbar"
import { PagePreview } from "@/widgets/page-preview"

import styles from "./EditorPage.module.scss"

export function EditorPage() {
  const isPreviewOpen = usePreviewModeStore((state) => state.isOpen)

  useHistoryHotkeys()

  if (isPreviewOpen) {
    return <PagePreview />
  }

  return (
    <div className={styles.page}>
      <EditorToolbar />

      <div className={styles.columns}>
        <BlockPalette />
        <BlockStructure />
        <BlockInspector />
      </div>
    </div>
  )
}
