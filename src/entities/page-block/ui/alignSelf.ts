import type { BlockAlign } from "../model/types"

export const ALIGN_SELF: Record<
  BlockAlign,
  "flex-start" | "center" | "flex-end"
> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
}
