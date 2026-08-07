import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

import { selectBlocks, useDocumentStore } from "@/entities/page-document"
import { reorderBlocks } from "@/features/block-editing"
import { SortableBlockCard } from "@/features/block-reordering"
import { useSelectionStore } from "@/features/block-selection"
import { cn } from "@/shared/lib/cn"

import { BlockCard } from "./BlockCard"
import styles from "./BlockStructure.module.scss"

export function BlockStructure() {
  const blocks = useDocumentStore(selectBlocks)
  const selectedId = useSelectionStore((state) => state.selectedId)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  return (
    <section className={styles.structure}>
      <h2 className={styles.title}>Структура страницы</h2>

      {blocks.length === 0 ? (
        <p className={styles.empty}>
          Пока пусто. Добавьте первый блок из палитры слева.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={({ active, over }) => {
            if (over) {
              reorderBlocks(String(active.id), String(over.id))
            }
          }}
        >
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className={styles.list}>
              {blocks.map((block, index) => (
                <SortableBlockCard
                  key={block.id}
                  id={block.id}
                  className={cn(
                    styles.card,
                    block.id === selectedId && styles.cardSelected
                  )}
                >
                  <BlockCard block={block} position={index + 1} />
                </SortableBlockCard>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </section>
  )
}
