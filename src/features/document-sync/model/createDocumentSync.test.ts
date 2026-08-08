import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { PageBlock } from "@/entities/page-block"
import type { PageDocument, SavePageInput } from "@/entities/page-document"
import {
  selectBlocks,
  useDocumentStore,
  useSyncStore,
} from "@/entities/page-document"
import { ConflictError, RequestError } from "@/shared/api"
import { AUTOSAVE_DEBOUNCE_MS } from "@/shared/config"

import { createDocumentSync, type DocumentSync } from "./createDocumentSync"

function textBlock(id: string, text: string): PageBlock {
  return {
    id,
    type: "text",
    text,
    layout: { align: "left", marginTop: 16, marginBottom: 0 },
  }
}

const initial = [textBlock("a", "Начало")]

function serverDocument(version: number, blocks: PageBlock[]): PageDocument {
  return { id: "page-1", version, blocks }
}

const savePage = vi.fn<(input: SavePageInput) => Promise<PageDocument>>()

let sync: DocumentSync
let stop: () => void

function edit(text: string): void {
  useDocumentStore.getState().applyBlocks([textBlock("a", text)])
}

beforeEach(() => {
  vi.useFakeTimers()
  savePage.mockReset()
  savePage.mockResolvedValue(serverDocument(2, initial))

  useDocumentStore.getState().initialize(initial)
  useSyncStore.getState().initialize(1)

  sync = createDocumentSync({ savePage })
  stop = sync.start()
})

afterEach(() => {
  stop()
  vi.useRealTimers()
})

describe("document sync", () => {
  it("sends the request only after the debounce has elapsed", async () => {
    edit("Правка")

    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS - 1)
    expect(savePage).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(savePage).toHaveBeenCalledTimes(1)
  })

  it("collapses two quick changes into a single request", async () => {
    edit("Раз")
    await vi.advanceTimersByTimeAsync(300)
    edit("Два")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    expect(savePage).toHaveBeenCalledTimes(1)
    expect(savePage.mock.calls[0][0].blocks).toEqual([textBlock("a", "Два")])
  })

  it("keeps a single request in flight and sends pending edits right after it", async () => {
    let release = (): void => {}
    savePage.mockImplementation(
      () =>
        new Promise<PageDocument>((resolve) => {
          release = () => {
            resolve(serverDocument(2, initial))
          }
        })
    )

    edit("Первая")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)
    expect(savePage).toHaveBeenCalledTimes(1)

    edit("Вторая")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)
    expect(savePage).toHaveBeenCalledTimes(1)

    savePage.mockResolvedValue(serverDocument(3, initial))
    release()
    await vi.advanceTimersByTimeAsync(0)

    expect(savePage).toHaveBeenCalledTimes(2)
    expect(savePage.mock.calls[1][0].blocks).toEqual([textBlock("a", "Вторая")])
  })

  it("marks the sent revision as saved, not the current one", async () => {
    const pending: ((document: PageDocument) => void)[] = []
    savePage.mockImplementation(
      () =>
        new Promise<PageDocument>((resolve) => {
          pending.push(resolve)
        })
    )

    edit("Отправлено")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    const sentRevision = useDocumentStore.getState().revision
    edit("Напечатано во время запроса")

    pending[0](serverDocument(2, initial))
    await vi.advanceTimersByTimeAsync(0)

    expect(useSyncStore.getState().savedRevision).toBe(sentRevision)
    expect(useDocumentStore.getState().revision).toBeGreaterThan(sentRevision)
  })

  it("never applies blocks from the response", async () => {
    savePage.mockResolvedValue(
      serverDocument(2, [textBlock("a", "Ответ сервера")])
    )

    edit("Локальный текст")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    expect(selectBlocks(useDocumentStore.getState())).toEqual([
      textBlock("a", "Локальный текст"),
    ])
  })

  it("freezes the loop on a version conflict", async () => {
    const server = serverDocument(5, [textBlock("a", "Серверный текст")])
    savePage.mockRejectedValue(new ConflictError(server))

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    expect(useSyncStore.getState().status).toBe("conflict")
    expect(useSyncStore.getState().conflict).toEqual({ server })

    edit("Ещё правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS * 3)

    expect(savePage).toHaveBeenCalledTimes(1)
    expect(useSyncStore.getState().status).toBe("conflict")
  })

  it("sends force with the server version after resolving in favour of local", async () => {
    savePage.mockRejectedValueOnce(
      new ConflictError(serverDocument(5, initial))
    )

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    savePage.mockResolvedValue(serverDocument(6, initial))
    useSyncStore.getState().resolveWithLocal(5)
    await vi.advanceTimersByTimeAsync(0)

    expect(savePage).toHaveBeenCalledTimes(2)
    expect(savePage.mock.calls[1][0]).toMatchObject({ force: true, version: 5 })
  })

  it("does not send anything after accepting the server version", async () => {
    savePage.mockRejectedValueOnce(
      new ConflictError(serverDocument(5, initial))
    )

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    const server = [textBlock("a", "Серверный текст")]
    useDocumentStore.getState().applyBlocks(server)
    useSyncStore
      .getState()
      .resolveWithServer(5, useDocumentStore.getState().revision)
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS * 3)

    expect(savePage).toHaveBeenCalledTimes(1)
    expect(useSyncStore.getState().status).toBe("saved")
  })

  it("does not treat a re-initialised store as a resolved conflict", async () => {
    savePage.mockRejectedValueOnce(
      new ConflictError(serverDocument(5, initial))
    )

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)
    expect(useSyncStore.getState().status).toBe("conflict")

    useSyncStore.getState().initialize(5)
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS * 3)

    expect(savePage).toHaveBeenCalledTimes(1)
  })

  it("stops on an error and does not retry by itself", async () => {
    savePage.mockRejectedValue(new RequestError("Сервер недоступен"))

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    expect(useSyncStore.getState().status).toBe("error")
    expect(useSyncStore.getState().error).toBe("Сервер недоступен")

    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS * 5)
    expect(savePage).toHaveBeenCalledTimes(1)
  })

  it("retries on flush after an error", async () => {
    savePage.mockRejectedValueOnce(new RequestError("Сервер недоступен"))

    edit("Правка")
    await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS)

    savePage.mockResolvedValue(serverDocument(2, initial))
    sync.flush()
    await vi.advanceTimersByTimeAsync(0)

    expect(savePage).toHaveBeenCalledTimes(2)
    expect(useSyncStore.getState().status).toBe("saved")
  })
})
