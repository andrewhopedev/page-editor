import { describe, expect, it } from "vitest"

import {
  breakMerge,
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
  type PushOptions,
} from "./history"

const DEPTH = 20
const MERGE_WINDOW_MS = 600

function push(
  history: History<string>,
  next: string,
  options: Partial<PushOptions> = {}
) {
  return pushHistory(history, next, {
    now: 0,
    depth: DEPTH,
    mergeWindowMs: MERGE_WINDOW_MS,
    ...options,
  })
}

describe("history", () => {
  it("keeps the previous state in past and returns to it on undo", () => {
    const pushed = push(createHistory("a"), "b")

    expect(pushed.past).toEqual(["a"])
    expect(pushed.present).toBe("b")
    expect(canUndo(pushed)).toBe(true)

    const undone = undoHistory(pushed)

    expect(undone.present).toBe("a")
    expect(undone.past).toEqual([])
    expect(undone.future).toEqual(["b"])
  })

  it("returns the undone state on redo", () => {
    const undone = undoHistory(push(createHistory("a"), "b"))

    expect(canRedo(undone)).toBe(true)

    const redone = redoHistory(undone)

    expect(redone.present).toBe("b")
    expect(redone.past).toEqual(["a"])
    expect(redone.future).toEqual([])
  })

  it("drops the redo branch on a push after undo", () => {
    const undone = undoHistory(push(createHistory("a"), "b"))
    const branched = push(undone, "c")

    expect(branched.present).toBe("c")
    expect(branched.future).toEqual([])
    expect(canRedo(branched)).toBe(false)
  })

  it("limits past to the given depth and drops the oldest states", () => {
    let history = createHistory("state-0")

    for (let step = 1; step <= DEPTH + 5; step += 1) {
      history = push(history, `state-${step}`)
    }

    expect(history.past).toHaveLength(DEPTH)
    expect(history.past[0]).toBe("state-5")
    expect(history.present).toBe(`state-${DEPTH + 5}`)
  })

  it("replaces the present in place when the same mergeKey stays inside the window", () => {
    const first = push(createHistory("a"), "ab", {
      mergeKey: "blk:text",
      now: 1000,
    })
    const second = push(first, "abc", {
      mergeKey: "blk:text",
      now: 1000 + MERGE_WINDOW_MS - 1,
    })

    expect(second.past).toEqual(["a"])
    expect(second.present).toBe("abc")
  })

  it("starts a new step when the same mergeKey comes after the window", () => {
    const first = push(createHistory("a"), "ab", {
      mergeKey: "blk:text",
      now: 1000,
    })
    const second = push(first, "abc", {
      mergeKey: "blk:text",
      now: 1000 + MERGE_WINDOW_MS,
    })

    expect(second.past).toEqual(["a", "ab"])
  })

  it("starts a new step for a different mergeKey", () => {
    const first = push(createHistory("a"), "ab", {
      mergeKey: "blk:text",
      now: 1000,
    })
    const second = push(first, "abc", { mergeKey: "blk:alt", now: 1010 })

    expect(second.past).toEqual(["a", "ab"])
  })

  it("starts a new step for every push without a mergeKey", () => {
    const first = push(createHistory("a"), "b", { now: 1000 })
    const second = push(first, "c", { now: 1010 })

    expect(second.past).toEqual(["a", "b"])
  })

  it("ends the coalescing series on breakMerge", () => {
    const typed = push(createHistory("a"), "ab", {
      mergeKey: "blk:text",
      now: 1000,
    })
    const continued = push(breakMerge(typed), "abc", {
      mergeKey: "blk:text",
      now: 1010,
    })

    expect(continued.past).toEqual(["a", "ab"])
  })

  it("ends the coalescing series on undo", () => {
    const typed = push(push(createHistory("a"), "ab"), "abc", {
      mergeKey: "blk:text",
      now: 1000,
    })
    const continued = push(undoHistory(typed), "abd", {
      mergeKey: "blk:text",
      now: 1010,
    })

    expect(continued.present).toBe("abd")
    expect(continued.past).toEqual(["a", "ab"])
  })

  it("leaves the history untouched on undo and redo with empty stacks", () => {
    const history = createHistory("a")

    expect(undoHistory(history)).toBe(history)
    expect(redoHistory(history)).toBe(history)
    expect(canUndo(history)).toBe(false)
    expect(canRedo(history)).toBe(false)
  })
})
