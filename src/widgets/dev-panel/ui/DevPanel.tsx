import { XIcon } from "lucide-react"
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
        variant="outline"
        size="sm"
        className={styles.toggle}
        onClick={() => {
          setOpen(true)
        }}
      >
        Отладка
      </Button>
    )
  }

  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>
        Отладка
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Свернуть панель отладки"
          onClick={() => {
            setOpen(false)
          }}
        >
          <XIcon />
        </Button>
      </h2>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          mockServer.simulateExternalEdit()
        }}
      >
        Изменить документ на сервере
      </Button>

      <div className={styles.control}>
        <span className={styles.caption}>
          Задержка ответа <span>{latency} мс</span>
        </span>
        <Slider
          min={0}
          max={2000}
          step={100}
          value={[latency]}
          onValueChange={(value) => {
            const next = firstValue(value)

            mockServer.setLatency(next)
            setLatency(next)
          }}
        />
      </div>

      <div className={styles.control}>
        <span className={styles.caption}>
          Вероятность ошибки <span>{errorPercent}%</span>
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
      </div>
    </aside>
  )
}
