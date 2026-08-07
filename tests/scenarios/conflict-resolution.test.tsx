import { screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import { mockServer } from "@/entities/page-document"

import { renderEditor } from "./renderEditor"

async function editIntoConflict() {
  const user = await renderEditor()

  mockServer.simulateExternalEdit()

  await user.click(screen.getByRole("button", { name: "1. Текст" }))

  const text = screen.getByRole("textbox", { name: "Текст" })
  await user.clear(text)
  await user.type(text, "Мой текст")

  await screen.findByRole("dialog", undefined, { timeout: 3000 })

  return user
}

describe("version conflict", () => {
  beforeEach(() => {
    mockServer.reset()
  })

  it("shows both versions with the diverging block marked", async () => {
    await editIntoConflict()

    expect(screen.getByText(/Ваша версия/)).toBeInTheDocument()
    expect(screen.getByText(/Версия на сервере/)).toBeInTheDocument()
    expect(screen.getAllByText("изменён")).toHaveLength(2)
  })

  it("replaces the document when the server version is accepted", async () => {
    const user = await editIntoConflict()

    await user.click(screen.getByRole("button", { name: "Принять серверную" }))

    const text = screen.getByRole<HTMLTextAreaElement>("textbox", {
      name: "Текст",
    })
    expect(text.value).toContain("изменён на сервере")

    await screen.findByText("Сохранено", undefined, { timeout: 3000 })
  })

  it("restores the local version by undo after accepting the server one", async () => {
    const user = await editIntoConflict()

    await user.click(screen.getByRole("button", { name: "Принять серверную" }))
    await user.click(screen.getByRole("button", { name: "Отменить" }))

    expect(screen.getByRole("textbox", { name: "Текст" })).toHaveValue(
      "Мой текст"
    )
  })

  it("forces the local version onto the server when asked to overwrite", async () => {
    const user = await editIntoConflict()

    await user.click(screen.getByRole("button", { name: "Перезаписать своей" }))
    await screen.findByText("Сохранено", undefined, { timeout: 3000 })

    const saved = await mockServer.getPage()
    expect(saved.blocks[0]).toMatchObject({ text: "Мой текст" })
  })

  it("keeps the document editable and sends nothing while unresolved", async () => {
    const user = await editIntoConflict()

    await user.click(screen.getByRole("button", { name: "Закрыть" }))

    const text = screen.getByRole("textbox", { name: "Текст" })
    await user.type(text, " и ещё")

    expect(text).toHaveValue("Мой текст и ещё")
    expect(screen.getByText("Конфликт версий")).toBeInTheDocument()

    const saved = await mockServer.getPage()
    expect(saved.blocks[0]).not.toMatchObject({ text: "Мой текст и ещё" })
  })
})
