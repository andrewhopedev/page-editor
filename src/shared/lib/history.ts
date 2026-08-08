export interface History<T> {
  past: T[]
  present: T
  future: T[]
  lastMergeKey: string | null
  lastPushAt: number
}

export interface PushOptions {
  mergeKey?: string | null
  now: number
  depth: number
  mergeWindowMs: number
}

export function createHistory<T>(present: T): History<T> {
  return {
    past: [],
    present,
    future: [],
    lastMergeKey: null,
    lastPushAt: 0,
  }
}

/**
 * Не создаёт новый шаг истории, если mergeKey совпадает с предыдущим и с момента
 * последнего изменения прошло меньше mergeWindowMs - present заменяется на месте.
 * mergeKey === null не сливается никогда. Любой push очищает ветку redo.
 *
 * mergeWindowMs — окно бездействия, а не длина серии: lastPushAt обновляется на
 * каждом слиянии, поэтому непрерывный ввод остаётся одним шагом до паузы.
 */
export function pushHistory<T>(
  history: History<T>,
  next: T,
  options: PushOptions
): History<T> {
  const { mergeKey = null, now, depth, mergeWindowMs } = options
  const mergeable =
    mergeKey !== null &&
    mergeKey === history.lastMergeKey &&
    now - history.lastPushAt < mergeWindowMs

  if (mergeable) {
    return { ...history, present: next, future: [], lastPushAt: now }
  }

  const past = [...history.past, history.present]

  return {
    past: past.slice(Math.max(0, past.length - depth)),
    present: next,
    future: [],
    lastMergeKey: mergeKey,
    lastPushAt: now,
  }
}

export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) {
    return history
  }

  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1],
    future: [history.present, ...history.future],
    lastMergeKey: null,
    lastPushAt: history.lastPushAt,
  }
}

export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) {
    return history
  }

  return {
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
    lastMergeKey: null,
    lastPushAt: history.lastPushAt,
  }
}

export function breakMerge<T>(history: History<T>): History<T> {
  return { ...history, lastMergeKey: null }
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0
}
