import { usePreviewModeStore } from "@/features/preview-mode"
import { BlockInspector } from "@/widgets/block-inspector"
import { BlockPalette } from "@/widgets/block-palette"
import { BlockStructure } from "@/widgets/block-structure"
import { EditorToolbar } from "@/widgets/editor-toolbar"
import { PagePreview } from "@/widgets/page-preview"

export function EditorPage() {
  const isPreviewOpen = usePreviewModeStore((state) => state.isOpen)

  if (isPreviewOpen) {
    return <PagePreview />
  }

  return (
    <div className="flex h-svh min-w-[900px] flex-col">
      <EditorToolbar />

      <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_320px]">
        <BlockPalette />
        <BlockStructure />
        <BlockInspector />
      </div>
    </div>
  )
}
