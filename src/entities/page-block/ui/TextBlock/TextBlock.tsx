import type { BlockLayout } from "../../model/types"

import styles from "./TextBlock.module.scss"

interface TextBlockProps {
  text: string
  layout: BlockLayout
}

export function TextBlock({ text, layout }: TextBlockProps) {
  return (
    <p
      className={styles.text}
      style={{
        textAlign: layout.align,
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
      }}
    >
      {text}
    </p>
  )
}
