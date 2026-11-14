import { useSyncExternalStore } from 'react'

/**
 * Explorer log (US-5.8): which worlds, stories and machines this visitor has explored.
 * Kept in this browser only (localStorage) — never sent anywhere, no account (NFR-LEGAL-001).
 * Every read and write tolerates blocked storage: the log then simply lasts for the visit.
 */
export interface ExplorerLog {
  worlds: string[]
  stories: string[]
  machines: string[]
}

const KEY = 'aeroreborn.explorer-log'
const EMPTY: ExplorerLog = { worlds: [], stories: [], machines: [] }
const listeners = new Set<() => void>()
let cache: ExplorerLog | null = null

function read(): ExplorerLog {
  if (cache) return cache
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? 'null') as Partial<ExplorerLog> | null
    cache = {
      worlds: Array.isArray(parsed?.worlds) ? parsed.worlds.filter((v) => typeof v === 'string') : [],
      stories: Array.isArray(parsed?.stories) ? parsed.stories.filter((v) => typeof v === 'string') : [],
      machines: Array.isArray(parsed?.machines) ? parsed.machines.filter((v) => typeof v === 'string') : [],
    }
  } catch {
    cache = EMPTY
  }
  return cache
}

function write(next: ExplorerLog) {
  cache = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage blocked: keep the in-memory log for this visit.
  }
  listeners.forEach((listener) => listener())
}

/** Adds `id` to one list of the log (no-op if already there). */
export function record(kind: keyof ExplorerLog, id: string) {
  const log = read()
  if (log[kind].includes(id)) return
  write({ ...log, [kind]: [...log[kind], id] })
}

export function resetExplorerLog() {
  write(EMPTY)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useExplorerLog(): ExplorerLog {
  return useSyncExternalStore(subscribe, read, () => EMPTY)
}

/** Test helper: forget the in-memory copy so the next read comes from storage again. */
export function __resetExplorerLogCache() {
  cache = null
}
