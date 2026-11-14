import type {
  DestinationDetail,
  DestinationSummary,
  Lang,
  MachineDetail,
  MissionDetail,
  Source,
  StoryDetail,
} from './types'

/**
 * Base URL of the API. Empty in development: Vite proxies /api to the backend (vite.config.ts).
 * In production, set VITE_API_BASE_URL to the deployed API origin (hosting: OPEN-05).
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiGet<T>(path: string, lang: Lang, signal?: AbortSignal): Promise<T> {
  const separator = path.includes('?') ? '&' : '?'
  const response = await fetch(`${API_BASE}/api${path}${separator}lang=${lang}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    throw new ApiError(response.status, `GET ${path} failed with HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

const id = (value: string) => encodeURIComponent(value)

/** One function per endpoint, so pages never build URLs by hand. */
export const api = {
  destinations: (lang: Lang, signal?: AbortSignal) => apiGet<DestinationSummary[]>('/destinations', lang, signal),
  destination: (destinationId: string, lang: Lang, signal?: AbortSignal) =>
    apiGet<DestinationDetail>(`/destinations/${id(destinationId)}`, lang, signal),
  mission: (missionId: string, lang: Lang, signal?: AbortSignal) =>
    apiGet<MissionDetail>(`/missions/${id(missionId)}`, lang, signal),
  machine: (machineId: string, lang: Lang, signal?: AbortSignal) =>
    apiGet<MachineDetail>(`/machines/${id(machineId)}`, lang, signal),
  story: (storyId: string, lang: Lang, signal?: AbortSignal) =>
    apiGet<StoryDetail>(`/stories/${id(storyId)}`, lang, signal),
  sources: (lang: Lang, signal?: AbortSignal) => apiGet<Source[]>('/sources', lang, signal),
}
