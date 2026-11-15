import { useCallback, useEffect, useRef, useState } from 'react'
import type { Lang } from '@/api/types'
import { useTranslation } from '@/i18n'
import { contentLang } from '@/i18n/translate'

export type ApiState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error }

type Result<T> = { requestKey: string; data: T; error: null } | { requestKey: string; data: null; error: Error }

/**
 * Loads data from the API for the current interface language, cancels stale requests,
 * and reloads when the language, the `key` or a retry changes. Pass `enabled: false`
 * to wait (e.g. until a panel is opened). The `key` must identify the request.
 */
export function useApi<T>(
  key: string,
  load: (lang: Lang, signal: AbortSignal) => Promise<T>,
  { enabled = true }: { enabled?: boolean } = {},
): ApiState<T> & { retry: () => void } {
  const { locale } = useTranslation()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)
  const requestKey = `${key}|${locale}|${attempt}`

  // Always call the latest `load` without re-running the request when only its identity changes.
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    loadRef.current(contentLang(locale), controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ requestKey, data, error: null })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        setResult({ requestKey, data: null, error: error instanceof Error ? error : new Error(String(error)) })
      },
    )
    return () => controller.abort()
  }, [requestKey, locale, enabled])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  // A result is only shown if it answers the current request; otherwise we are loading.
  if (!result || result.requestKey !== requestKey) return { status: 'loading', data: null, error: null, retry }
  if (result.error) return { status: 'error', data: null, error: result.error, retry }
  return { status: 'success', data: result.data as T, error: null, retry }
}
