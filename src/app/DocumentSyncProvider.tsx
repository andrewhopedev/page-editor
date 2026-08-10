import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

import { pageApi } from "@/entities/page-document"
import { bootstrapDocument, documentSync } from "@/features/document-sync"
import { Button } from "@/shared/ui/button"

import styles from "./DocumentSyncProvider.module.scss"

interface DocumentSyncProviderProps {
  children: ReactNode
}

type LoadState = "loading" | "ready" | "failed"

export function DocumentSyncProvider({ children }: DocumentSyncProviderProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading")
  const isBootstrapped = useRef(false)

  const load = useCallback(() => {
    setLoadState("loading")

    void bootstrapDocument(pageApi).then(
      () => {
        setLoadState("ready")
      },
      () => {
        setLoadState("failed")
      }
    )
  }, [])

  useEffect(() => {
    const stop = documentSync.start()

    if (!isBootstrapped.current) {
      isBootstrapped.current = true
      load()
    }

    return stop
  }, [load])

  if (loadState === "loading") {
    return <p className={styles.loading}>Загружаем страницу…</p>
  }

  if (loadState === "failed") {
    return (
      <div className={styles.loading}>
        <p>Не удалось загрузить страницу</p>
        <Button variant="outline" size="sm" onClick={load}>
          Повторить
        </Button>
      </div>
    )
  }

  return children
}
