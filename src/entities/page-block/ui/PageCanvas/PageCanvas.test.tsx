import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { PageBlock } from "../../model/types"

import { PageCanvas } from "./PageCanvas"

const layout = { align: "left", marginTop: 16, marginBottom: 0 } as const

const blocks: PageBlock[] = [
  { id: "a", type: "text", text: "Первая строка\nВторая строка", layout },
  {
    id: "b",
    type: "image",
    url: "https://example.com/cover.png",
    alt: "Обложка",
    layout,
  },
  {
    id: "c",
    type: "button",
    label: "Купить",
    href: "https://example.com",
    layout,
  },
]

describe("PageCanvas", () => {
  it("renders every block type", () => {
    render(<PageCanvas blocks={blocks} />)

    expect(screen.getByText(/Первая строка/)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Обложка" })).toHaveAttribute(
      "src",
      "https://example.com/cover.png"
    )
    expect(screen.getByRole("link", { name: "Купить" })).toHaveAttribute(
      "href",
      "https://example.com"
    )
  })

  it("applies alignment and margins of a block", () => {
    render(
      <PageCanvas
        blocks={[
          {
            id: "a",
            type: "text",
            text: "Текст",
            layout: { align: "center", marginTop: 24, marginBottom: 8 },
          },
        ]}
      />
    )

    expect(screen.getByText("Текст")).toHaveStyle({
      textAlign: "center",
      marginTop: "24px",
      marginBottom: "8px",
    })
  })

  it("carries alignment and margins on the image itself", () => {
    render(
      <PageCanvas
        blocks={[
          {
            ...blocks[1],
            layout: { align: "right", marginTop: 12, marginBottom: 4 },
          } as PageBlock,
        ]}
      />
    )

    expect(screen.getByRole("img", { name: "Обложка" })).toHaveStyle({
      alignSelf: "flex-end",
      marginTop: "12px",
      marginBottom: "4px",
    })
  })

  it("shows a placeholder for an image without a url", () => {
    render(<PageCanvas blocks={[{ ...blocks[1], url: "" } as PageBlock]} />)

    expect(screen.getByText("Изображение не выбрано")).toBeInTheDocument()
  })

  it("shows a placeholder when the image fails to load", () => {
    render(<PageCanvas blocks={blocks} />)

    fireEvent.error(screen.getByRole("img", { name: "Обложка" }))

    expect(screen.getByText("Изображение не загрузилось")).toBeInTheDocument()
  })
})
