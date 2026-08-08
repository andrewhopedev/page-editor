import type { BlockLayout } from "../../model/types"
import { ALIGN_SELF } from "../alignSelf"

import styles from "./ButtonBlock.module.scss"

interface ButtonBlockProps {
  label: string
  href: string
  layout: BlockLayout
}

export function ButtonBlock({ label, href, layout }: ButtonBlockProps) {
  return (
    <a
      className={styles.button}
      style={{
        alignSelf: ALIGN_SELF[layout.align],
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
      }}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  )
}
