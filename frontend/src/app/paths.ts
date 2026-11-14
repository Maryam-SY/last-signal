import type { DestinationId } from '@/types/content'

/** Single place that builds URLs (routes are documented in ARCHITECTURE.md §4). */
export const paths = {
  home: () => '/',
  destination: (id: DestinationId) => `/explore/${id}`,
  story: (storyId: string) => `/stories/${encodeURIComponent(storyId)}`,
  about: () => '/about',
} as const
