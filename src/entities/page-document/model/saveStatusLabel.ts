import type { SaveStatus } from "./types"

export const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Есть изменения",
  saving: "Сохраняется",
  saved: "Сохранено",
  error: "Ошибка сохранения",
  conflict: "Конфликт версий",
}
