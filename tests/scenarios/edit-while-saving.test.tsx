import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { mockServer } from "@/entities/page-document"

import { renderEditor } from "./renderEditor"

describe("editing while a save is in flight", () => {
  it("keeps the edits made during the request and sends them next", async () => {
    const user = await renderEditor(300)

    await user.click(screen.getByRole("button", { name: "1. Текст" }))

    const text = screen.getByRole("textbox", { name: "Текст" })

    await user.clear(text)
    await user.type(text, "Первая")

    await screen.findByText("Сохраняется", undefined, { timeout: 3000 })

    await user.type(text, " и вторая")

    await screen.findByText("Сохранено", undefined, { timeout: 5000 })

    expect(text).toHaveValue("Первая и вторая")

    const saved = await mockServer.getPage()
    expect(saved.blocks[0]).toMatchObject({ text: "Первая и вторая" })
  })
})
