import { pageApi } from "@/entities/page-document"

import { createDocumentSync } from "./createDocumentSync"

export const documentSync = createDocumentSync(pageApi)
