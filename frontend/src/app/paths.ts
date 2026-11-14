import type { DestinationId } from '@/types/content'

function withQuery(path: string, query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) if (value !== undefined) params.set(key, String(value))
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

/** Single place that builds URLs (routes are documented in ARCHITECTURE.md §4). */
export const paths = {
  home: () => '/',
  destination: (id: DestinationId, query: { machine?: string } = {}) => withQuery(`/explore/${id}`, query),
  story: (storyId: string, query: { step?: number; from?: string } = {}) =>
    withQuery(`/stories/${encodeURIComponent(storyId)}`, query),
  about: () => '/about',
} as const
