import { beforeEach, describe, expect, it } from "vitest"

import type { PageBlock } from "@/entities/page-block"
import { selectBlocks, useDocumentStore } from "@/entities/page-document"

import {
  addBlock,
  duplicateBlock,
  removeBlock,
  reorderBlocks,
  updateBlock,
} from "./blockEditing"

function blocks(): PageBlock[] {
  return selectBlocks(useDocumentStore.getState())
}

function revision(): number {
  return useDocumentStore.getState().revision
}

const intro: PageBlock = {
  id: "a",
  type: "text",
  text: "Первый",
  layout: { align: "left", marginTop: 16, marginBottom: 0 },
}

const cover: PageBlock = {
  id: "b",
  type: "image",
  url: "https://example.com/cover.png",
  alt: "Обложка",
  layout: { align: "center", marginTop: 24, marginBottom: 0 },
}

const cta: PageBlock = {
  id: "c",
  type: "button",
  label: "Купить",
  href: "https://example.com",
  layout: { align: "right", marginTop: 8, marginBottom: 0 },
}

beforeEach(() => {
  useDocumentStore.getState().initialize([intro, cover, cta])
})

describe("block editing", () => {
  it("appends a new block of the requested type", () => {
    const added = addBlock("button")

    expect(blocks()).toHaveLength(4)
    expect(blocks()[3]).toBe(added)
    expect(added.type).toBe("button")
  })

  it("replaces a block by id and leaves the rest alone", () => {
    updateBlock({ ...intro, text: "Изменённый" })

    expect(blocks()[0]).toEqual({ ...intro, text: "Изменённый" })
    expect(blocks()[1]).toBe(cover)
  })

  it("ignores an update for an unknown id", () => {
    updateBlock({ ...intro, id: "missing" })

    expect(revision()).toBe(0)
  })

  it("inserts a duplicate after the source with a new id and the same content", () => {
    const copy = duplicateBlock("b")

    expect(copy).not.toBeNull()
    expect(copy?.id).not.toBe(cover.id)
    expect(blocks()[2]).toBe(copy)
    expect({ ...copy, id: cover.id }).toEqual(cover)
  })

  it("removes a block and ignores an unknown id", () => {
    removeBlock("b")

    expect(blocks().map((block) => block.id)).toEqual(["a", "c"])

    const afterRemoval = revision()
    removeBlock("missing")

    expect(revision()).toBe(afterRemoval)
  })

  it("reorders blocks without recreating them", () => {
    reorderBlocks("c", "a")

    expect(blocks()).toEqual([cta, intro, cover])
    expect(blocks()[0]).toBe(cta)
    expect(blocks()[1]).toBe(intro)
    expect(blocks()[2]).toBe(cover)
  })

  it("counts a reorder as a single history step", () => {
    reorderBlocks("a", "c")

    expect(revision()).toBe(1)
    expect(useDocumentStore.getState().history.past).toEqual([
      [intro, cover, cta],
    ])
  })

  it("ignores a reorder onto the same position or an unknown id", () => {
    reorderBlocks("a", "a")
    reorderBlocks("a", "missing")

    expect(revision()).toBe(0)
    expect(blocks()).toEqual([intro, cover, cta])
  })
})
