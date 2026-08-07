import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"

function DialogFixture() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

describe("test environment", () => {
  it("opens a portalled dialog", async () => {
    render(<DialogFixture />)

    await userEvent.click(screen.getByRole("button", { name: "Open" }))

    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("Description")).toBeVisible()
  })
})
