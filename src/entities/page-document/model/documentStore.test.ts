import { beforeEach, describe, expect, it } from "vitest"

import type { PageBlock } from "@/entities/page-block/@x/page-document"

import {
  selectBlocks,
  selectCanRedo,
  selectCanUndo,
  useDocumentStore,
} from "./documentStore"

function textBlock(id: string, text: string): PageBlock {
  return {
    id,
    type: "text",
    text,
    layout: { align: "left", marginTop: 16, marginBottom: 0 },
  }
}

const first = textBlock("a", "Первый")
const second = textBlock("b", "Второй")

beforeEach(() => {
  useDocumentStore.getState().initialize([first])
})

describe("documentStore", () => {
  it("resets history and revision on initialize", () => {
    const store = useDocumentStore.getState()

    store.applyBlocks([first, second])
    store.initialize([second])

    const state = useDocumentStore.getState()

    expect(selectBlocks(state)).toEqual([second])
    expect(state.revision).toBe(0)
    expect(selectCanUndo(state)).toBe(false)
    expect(selectCanRedo(state)).toBe(false)
  })

  it("raises revision on every applyBlocks", () => {
    const store = useDocumentStore.getState()

    store.applyBlocks([first, second])
    store.applyBlocks([second])

    expect(useDocumentStore.getState().revision).toBe(2)
  })

  it("raises revision on undo and redo", () => {
    const store = useDocumentStore.getState()

    store.applyBlocks([first, second])
    store.undo()

    expect(selectBlocks(useDocumentStore.getState())).toEqual([first])
    expect(useDocumentStore.getState().revision).toBe(2)

    store.redo()

    expect(selectBlocks(useDocumentStore.getState())).toEqual([first, second])
    expect(useDocumentStore.getState().revision).toBe(3)
  })

  it("keeps revision untouched when there is nothing to undo or redo", () => {
    const store = useDocumentStore.getState()

    store.undo()
    store.redo()

    expect(useDocumentStore.getState().revision).toBe(0)
  })

  it("merges consecutive changes that share a mergeKey into one step", () => {
    const store = useDocumentStore.getState()

    store.applyBlocks([textBlock("a", "Пе")], "a:text")
    store.applyBlocks([textBlock("a", "Пер")], "a:text")

    const state = useDocumentStore.getState()

    expect(state.history.past).toEqual([[first]])
    expect(selectBlocks(state)).toEqual([textBlock("a", "Пер")])
    expect(state.revision).toBe(2)
  })

  it("starts a new step after breakMerge", () => {
    const store = useDocumentStore.getState()

    store.applyBlocks([textBlock("a", "Пе")], "a:text")
    store.breakMerge()
    store.applyBlocks([textBlock("a", "Пер")], "a:text")

    expect(useDocumentStore.getState().history.past).toHaveLength(2)
  })
})
