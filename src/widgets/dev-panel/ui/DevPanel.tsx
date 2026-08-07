import { FlaskConicalIcon, XIcon } from "lucide-react"
import { useState } from "react"

import { mockServer } from "@/entities/page-document"
import { Button } from "@/shared/ui/button"
import { Slider } from "@/shared/ui/slider"

import styles from "./DevPanel.module.scss"

function firstValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number)
}

export function DevPanel() {
  const [isOpen, setOpen] = useState(false)
  const [latency, setLatency] = useState(mockServer.getLatency)
  const [errorPercent, setErrorPercent] = useState(
    () => mockServer.getErrorRate() * 100
  )

  if (!isOpen) {
    return (
      <Button
        size="lg"
        className={styles.toggle}
        onClick={() => {
          setOpen(true)
        }}
      >
        <FlaskConicalIcon />
        Проверка сценариев
      </Button>
    )
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          <FlaskConicalIcon size={15} />
          Проверка сценариев
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Свернуть панель"
          onClick={() => {
            setOpen(false)
          }}
        >
          <XIcon />
        </Button>
      </div>

      <div className={styles.item}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            mockServer.simulateExternalEdit()
          }}
        >
          Изменить документ на сервере
        </Button>
        <p className={styles.hint}>
          Поднимает версию документа на сервере. Следующее сохранение вернёт 409
          и откроет диалог конфликта.
        </p>
      </div>

      <div className={styles.item}>
        <span className={styles.itemHead}>
          Задержка ответа
          <span className={styles.value}>{latency} мс</span>
        </span>
        <Slider
          min={0}
          max={3000}
          step={100}
          value={[latency]}
          onValueChange={(value) => {
            const next = firstValue(value)

            mockServer.setLatency(next)
            setLatency(next)
          }}
        />
        <p className={styles.hint}>
          Пауза перед ответом сервера. Чем больше, тем дольше держится статус
          «Сохраняется».
        </p>
      </div>

      <div className={styles.item}>
        <span className={styles.itemHead}>
          Вероятность ошибки
          <span className={styles.value}>{errorPercent}%</span>
        </span>
        <Slider
          min={0}
          max={100}
          step={10}
          value={[errorPercent]}
          onValueChange={(value) => {
            const next = firstValue(value)

            mockServer.setErrorRate(next / 100)
            setErrorPercent(next)
          }}
        />
        <p className={styles.hint}>
          Доля запросов, на которые сервер ответит отказом. Даёт статус «Ошибка
          сохранения» и кнопку повтора.
        </p>
      </div>
    </aside>
  )
}
