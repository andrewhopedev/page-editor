import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { blockTitles, renderEditor } from "./renderEditor"

describe("history", () => {
  it("undoes and redoes a block addition", async () => {
    const user = await renderEditor()

    expect(blockTitles()).toHaveLength(3)

    await user.click(screen.getByRole("button", { name: "Кнопка" }))
    expect(blockTitles()).toHaveLength(4)

    await user.click(screen.getByRole("button", { name: "Отменить" }))
    expect(blockTitles()).toHaveLength(3)

    await user.click(screen.getByRole("button", { name: "Повторить" }))
    expect(blockTitles()).toHaveLength(4)
  })

  it("drops the redo branch once a new change is made after undo", async () => {
    const user = await renderEditor()

    await user.click(screen.getByRole("button", { name: "Кнопка" }))
    await user.click(screen.getByRole("button", { name: "Отменить" }))

    expect(screen.getByRole("button", { name: "Повторить" })).toBeEnabled()

    await user.click(screen.getByRole("button", { name: "Изображение" }))

    expect(screen.getByRole("button", { name: "Повторить" })).toBeDisabled()
    expect(blockTitles()).toEqual([
      "1. Текст",
      "2. Изображение",
      "3. Кнопка",
      "4. Изображение",
    ])
  })

  it("does not put block selection into the history", async () => {
    const user = await renderEditor()

    await user.click(screen.getByRole("button", { name: "Кнопка" }))

    await user.click(screen.getByRole("button", { name: "1. Текст" }))
    await user.click(screen.getByRole("button", { name: "2. Изображение" }))
    await user.click(screen.getByRole("button", { name: "3. Кнопка" }))

    await user.click(screen.getByRole("button", { name: "Отменить" }))

    expect(blockTitles()).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Отменить" })).toBeDisabled()
  })
})
