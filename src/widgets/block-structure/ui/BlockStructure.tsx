import { selectBlocks, useDocumentStore } from "@/entities/page-document"
import { useSelectionStore } from "@/features/block-selection"

import { BlockCard } from "./BlockCard"

export function BlockStructure() {
  const blocks = useDocumentStore(selectBlocks)
  const selectedId = useSelectionStore((state) => state.selectedId)

  return (
    <section className="min-w-0 overflow-y-auto bg-muted/40 p-4">
      <h2 className="mb-3 text-sm font-medium">Структура страницы</h2>

      {blocks.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Пока пусто. Добавьте первый блок из палитры слева.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              position={index + 1}
              isSelected={block.id === selectedId}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
