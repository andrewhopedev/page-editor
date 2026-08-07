import { useState } from "react"

import type { BlockLayout } from "../../model/types"
import { ALIGN_SELF } from "../alignSelf"

import styles from "./ImageBlock.module.scss"

interface ImageBlockProps {
  url: string
  alt: string
  layout: BlockLayout
}

export function ImageBlock({ url, alt, layout }: ImageBlockProps) {
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const style = {
    alignSelf: ALIGN_SELF[layout.align],
    marginTop: layout.marginTop,
    marginBottom: layout.marginBottom,
  }

  if (url === "") {
    return (
      <span className={styles.placeholder} style={style}>
        Изображение не выбрано
      </span>
    )
  }

  if (url === brokenUrl) {
    return (
      <span className={styles.placeholder} style={style}>
        Изображение не загрузилось
      </span>
    )
  }

  return (
    <img
      className={styles.image}
      style={style}
      src={url}
      alt={alt}
      onError={() => {
        setBrokenUrl(url)
      }}
    />
  )
}
