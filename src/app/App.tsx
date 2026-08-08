import { ConflictDialog } from "@/features/conflict-resolution"
import { EditorPage } from "@/pages/editor"

import { DocumentSyncProvider } from "./DocumentSyncProvider"

export function App() {
  return (
    <DocumentSyncProvider>
      <EditorPage />
      <ConflictDialog />
    </DocumentSyncProvider>
  )
}
