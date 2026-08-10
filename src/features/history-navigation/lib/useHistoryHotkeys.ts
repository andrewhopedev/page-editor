import { useEffect } from "react"

import { useDocumentStore } from "@/entities/page-document"

export function useHistoryHotkeys(): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!event.metaKey && !event.ctrlKey) {
        return
      }

      if (event.altKey) {
        return
      }

      if (event.code !== "KeyZ" && event.code !== "KeyY") {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const { undo, redo } = useDocumentStore.getState()

      if (event.code === "KeyY" || event.shiftKey) {
        redo()
      } else {
        undo()
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])
}
