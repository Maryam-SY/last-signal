import type { DestinationId } from '@/types/content'

/** Single place that builds URLs (routes are documented in ARCHITECTURE.md §4). */
export const paths = {
  home: () => '/',
  destination: (id: DestinationId) => `/explore/${id}`,
  /** One machine's own page: its whole life, from launch to its last signal (US-5.12). */
  machine: (destinationId: DestinationId, machineId: string) => `/explore/${destinationId}/${encodeURIComponent(machineId)}`,
  story: (storyId: string) => `/stories/${encodeURIComponent(storyId)}`,
  about: () => '/about',
} as const
