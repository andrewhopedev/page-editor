import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { App } from "@/app/App"
import { mockServer } from "@/entities/page-document"

export async function renderEditor(latencyMs = 0) {
  mockServer.setLatency(latencyMs)

  const user = userEvent.setup()

  render(<App />)
  await screen.findByRole("heading", { name: "Структура страницы" })

  return user
}

export function blockTitles(): string[] {
  return screen
    .getAllByRole("listitem")
    .map((item) => item.querySelector("button")?.textContent ?? "")
}
