import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const counter = vi.hoisted(() => ({ canvasRenders: 0 }))

vi.mock("@/entities/page-block", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/page-block")>()

  return {
    ...actual,
    PageCanvas(props: React.ComponentProps<typeof actual.PageCanvas>) {
      counter.canvasRenders += 1

      return <actual.PageCanvas {...props} />
    },
  }
})

import { renderEditor } from "./renderEditor"

describe("render isolation", () => {
  it("redraws only the edited block preview while typing", async () => {
    const user = await renderEditor()

    await user.click(screen.getByRole("button", { name: "1. Текст" }))

    const before = counter.canvasRenders

    await user.type(screen.getByLabelText("Текст"), "аб")

    // По одной перерисовке на символ: карточки остальных блоков не трогаются.
    // Без memo на BlockCard было бы по канвасу на каждый блок списка.
    expect(counter.canvasRenders - before).toBe(2)
  })
})
