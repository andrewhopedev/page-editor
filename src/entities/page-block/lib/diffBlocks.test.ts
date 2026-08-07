import { describe, expect, it } from "vitest"

import type { BlockDiffStatus } from "./diffBlocks"
import { diffBlocks } from "./diffBlocks"
import type { PageBlock } from "../model/types"

function textBlock(id: string, text: string): PageBlock {
  return {
    id,
    type: "text",
    text,
    layout: { align: "left", marginTop: 16, marginBottom: 16 },
  }
}

function statuses(entries: { status: BlockDiffStatus }[]) {
  return entries.map((entry) => entry.status)
}

describe("diffBlocks", () => {
  it("marks identical lists as same", () => {
    const blocks = [textBlock("a", "Первый"), textBlock("b", "Второй")]
    const diff = diffBlocks(blocks, structuredClone(blocks))

    expect(statuses(diff.local)).toEqual(["same", "same"])
    expect(statuses(diff.server)).toEqual(["same", "same"])
  })

  it("marks a block with the same id and different content as changed", () => {
    const diff = diffBlocks(
      [textBlock("a", "Локальный текст")],
      [textBlock("a", "Серверный текст")]
    )

    expect(statuses(diff.local)).toEqual(["changed"])
    expect(statuses(diff.server)).toEqual(["changed"])
  })

  it("marks a block missing on the other side as added", () => {
    const diff = diffBlocks(
      [textBlock("a", "Общий"), textBlock("local", "Только локально")],
      [textBlock("a", "Общий"), textBlock("server", "Только на сервере")]
    )

    expect(statuses(diff.local)).toEqual(["same", "added"])
    expect(statuses(diff.server)).toEqual(["same", "added"])
  })

  it("marks a block at a different index as moved", () => {
    const first = textBlock("a", "Первый")
    const second = textBlock("b", "Второй")
    const diff = diffBlocks([first, second], [second, first])

    expect(statuses(diff.local)).toEqual(["moved", "moved"])
    expect(statuses(diff.server)).toEqual(["moved", "moved"])
  })

  it("prefers changed over moved for a block that was edited and reordered", () => {
    const kept = textBlock("a", "Первый")
    const diff = diffBlocks(
      [kept, textBlock("b", "Локальный текст")],
      [textBlock("b", "Серверный текст"), kept]
    )

    expect(statuses(diff.local)).toEqual(["moved", "changed"])
    expect(statuses(diff.server)).toEqual(["changed", "moved"])
  })
})
