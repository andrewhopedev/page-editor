import { useEffect } from "react"

import { useDocumentStore } from "@/entities/page-document"

export function useHistoryHotkeys(): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (!event.metaKey && !event.ctrlKey) {
        return
      }

      if (event.code !== "KeyZ" && event.code !== "KeyY") {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const document = useDocumentStore.getState()

      if (event.code === "KeyY" || event.shiftKey) {
        document.redo()
      } else {
        document.undo()
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [])
}
