import type { Locale } from '@/i18n'
import type {
  DestinationDetail,
  DestinationId,
  MachineDetailData,
  Media,
  MissionDetail,
  Source,
  StoryDetail,
} from '@/types/content'

/** Same origin by default (Vite proxies /api in dev); VITE_API_BASE_URL for a separate API host. */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API ${status} on ${path}`)
    this.name = 'ApiError'
  }
}

async function getJson<T>(path: string, lang: Locale, signal?: AbortSignal): Promise<T> {
  const separator = path.includes('?') ? '&' : '?'
  const response = await fetch(`${API_BASE}/api${path}${separator}lang=${lang}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new ApiError(response.status, path)
  return (await response.json()) as T
}

const id = encodeURIComponent

/** Typed endpoints of the read-only content API (ARCHITECTURE.md §16), localized with ?lang=. */
export const api = {
  destination: (destinationId: DestinationId, lang: Locale, signal?: AbortSignal) =>
    getJson<DestinationDetail>(`/destinations/${destinationId}`, lang, signal),
  mission: (missionId: string, lang: Locale, signal?: AbortSignal) =>
    getJson<MissionDetail>(`/missions/${id(missionId)}`, lang, signal),
  machine: (machineId: string, lang: Locale, signal?: AbortSignal) =>
    getJson<MachineDetailData>(`/machines/${id(machineId)}`, lang, signal),
  story: (storyId: string, lang: Locale, signal?: AbortSignal) =>
    getJson<StoryDetail>(`/stories/${id(storyId)}`, lang, signal),
  sources: (lang: Locale, signal?: AbortSignal) => getJson<Source[]>('/sources', lang, signal),
  media: (filter: { missionId?: string; machineId?: string; type?: string }, lang: Locale, signal?: AbortSignal) => {
    const params = new URLSearchParams(Object.entries(filter).filter((entry): entry is [string, string] => !!entry[1]))
    return getJson<Media[]>(`/media?${params}`, lang, signal)
  },
} as const
