import { EditorPage } from "@/pages/editor"

import { DocumentSyncProvider } from "./DocumentSyncProvider"

export function App() {
  return (
    <DocumentSyncProvider>
      <EditorPage />
    </DocumentSyncProvider>
  )
}
