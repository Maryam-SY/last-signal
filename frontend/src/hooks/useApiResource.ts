import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/lib/api'

export type ApiResource<T> =
  | { status: 'loading'; data?: undefined; retry: () => void }
  | { status: 'not-found'; data?: undefined; retry: () => void }
  | { status: 'error'; data?: undefined; retry: () => void }
  | { status: 'success'; data: T; retry: () => void }

type State<T> = { key: string; status: 'success'; data: T } | { key: string; status: 'not-found' | 'error' }

/**
 * Loads one API resource. `key` identifies the request (change it to refetch); `null` skips
 * the request. In-flight requests are aborted when the key changes or the component unmounts.
 */
export function useApiResource<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>): ApiResource<T> {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<State<T> | null>(null)
  const requestKey = key === null ? null : `${key}#${attempt}`

  useEffect(() => {
    if (requestKey === null) return
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => setState({ key: requestKey, status: 'success', data }),
      (error: unknown) => {
        if (controller.signal.aborted) return
        const status = error instanceof ApiError && error.status === 404 ? 'not-found' : 'error'
        setState({ key: requestKey, status })
      },
    )
    return () => controller.abort()
    // `load` is intentionally not a dependency: callers pass inline functions keyed by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  if (state === null || state.key !== requestKey) return { status: 'loading', retry }
  if (state.status === 'success') return { status: 'success', data: state.data, retry }
  return { status: state.status, retry }
}
