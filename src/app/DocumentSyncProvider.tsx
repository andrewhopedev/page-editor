import { useEffect, useRef, useState, type ReactNode } from "react"

import { pageApi } from "@/entities/page-document"
import { bootstrapDocument, documentSync } from "@/features/document-sync"

import styles from "./DocumentSyncProvider.module.scss"

interface DocumentSyncProviderProps {
  children: ReactNode
}

export function DocumentSyncProvider({ children }: DocumentSyncProviderProps) {
  const [isLoaded, setLoaded] = useState(false)
  const isBootstrapped = useRef(false)

  useEffect(() => {
    const stop = documentSync.start()

    if (!isBootstrapped.current) {
      isBootstrapped.current = true

      void bootstrapDocument(pageApi).finally(() => {
        setLoaded(true)
      })
    }

    return stop
  }, [])

  if (!isLoaded) {
    return <p className={styles.loading}>Загружаем страницу…</p>
  }

  return children
}
