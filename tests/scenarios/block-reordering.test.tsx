import { act, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { selectBlocks, useDocumentStore } from "@/entities/page-document"
import { reorderBlocks } from "@/features/block-editing"

import { blockTitles, renderEditor } from "./renderEditor"

function currentBlocks() {
  return selectBlocks(useDocumentStore.getState())
}

describe("block reordering", () => {
  it("moves a block without losing its data or identity", async () => {
    await renderEditor()

    const before = currentBlocks()

    act(() => {
      reorderBlocks(before[2].id, before[0].id)
    })

    const after = currentBlocks()

    expect(after.map((block) => block.id)).toEqual([
      before[2].id,
      before[0].id,
      before[1].id,
    ])
    expect(after[0]).toBe(before[2])
    expect(after[1]).toBe(before[0])
    expect(after[2]).toBe(before[1])
  })

  it("renders the new order and keeps block content on the canvas", async () => {
    await renderEditor()

    const before = currentBlocks()

    act(() => {
      reorderBlocks(before[2].id, before[0].id)
    })

    await waitFor(() => {
      expect(blockTitles()).toEqual(["1. Кнопка", "2. Текст", "3. Изображение"])
    })
    expect(
      screen.getAllByRole("link", { name: "Оставить заявку" }).length
    ).toBeGreaterThan(0)
    expect(screen.getByRole("img", { name: "Обложка страницы" })).toBeVisible()
  })

  it("counts a reorder as a single history step", async () => {
    const user = await renderEditor()

    const before = currentBlocks()

    act(() => {
      reorderBlocks(before[2].id, before[0].id)
    })

    await user.click(screen.getByRole("button", { name: "Отменить" }))

    expect(currentBlocks().map((block) => block.id)).toEqual(
      before.map((block) => block.id)
    )
  })
})
