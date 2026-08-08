import type { PageBlock } from "@/entities/page-block/@x/page-document"
import { ConflictError, RequestError } from "@/shared/api"
import { delay } from "@/shared/lib/delay"

import type { PageDocument } from "../model/types"

export interface SavePageInput {
  blocks: PageBlock[]
  version: number
  force?: boolean
}

const INITIAL_LATENCY_MS = 600

function createInitialDocument(): PageDocument {
  return {
    id: "page-1",
    version: 1,
    blocks: [
      {
        id: "blk-intro",
        type: "text",
        text: "Заголовок",
        layout: { align: "left", marginTop: 32, marginBottom: 0 },
      },
      {
        id: "blk-cover",
        type: "image",
        url: "https://picsum.photos/seed/page-editor/960/420",
        alt: "Обложка страницы",
        layout: { align: "center", marginTop: 16, marginBottom: 0 },
      },
      {
        id: "blk-cta",
        type: "button",
        label: "Оставить заявку",
        href: "https://example.com",
        layout: { align: "center", marginTop: 16, marginBottom: 0 },
      },
    ],
  }
}

let storedDocument = createInitialDocument()
let latency = INITIAL_LATENCY_MS
let errorRate = 0

export const mockServer = {
  async getPage(): Promise<PageDocument> {
    await delay(latency)

    return structuredClone(storedDocument)
  },

  async savePage(input: SavePageInput): Promise<PageDocument> {
    await delay(latency)

    if (Math.random() < errorRate) {
      throw new RequestError("Сервер не принял документ")
    }

    if (!input.force && input.version !== storedDocument.version) {
      throw new ConflictError(structuredClone(storedDocument))
    }

    storedDocument = {
      ...storedDocument,
      blocks: structuredClone(input.blocks),
      version: storedDocument.version + 1,
    }

    return structuredClone(storedDocument)
  },

  simulateExternalEdit(): void {
    const blocks = structuredClone(storedDocument.blocks)
    const version = storedDocument.version + 1
    const firstText = blocks.find((block) => block.type === "text")

    if (firstText) {
      firstText.text = `Текст изменён на сервере, версия ${version}`
    } else {
      blocks.push({
        id: "blk-external",
        type: "text",
        text: `Блок добавлен на сервере, версия ${version}`,
        layout: { align: "left", marginTop: 16, marginBottom: 0 },
      })
    }

    storedDocument = { ...storedDocument, blocks, version }
  },

  setLatency(ms: number): void {
    latency = ms
  },

  setErrorRate(rate: number): void {
    errorRate = rate
  },

  getLatency(): number {
    return latency
  },

  getErrorRate(): number {
    return errorRate
  },

  reset(): void {
    storedDocument = createInitialDocument()
    latency = INITIAL_LATENCY_MS
    errorRate = 0
  },
}
