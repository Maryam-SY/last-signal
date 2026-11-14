import type { DestinationId } from '@/types/content'

/** Single place that builds URLs (routes are documented in ARCHITECTURE.md §4). */
export const paths = {
  home: () => '/',
  destination: (id: DestinationId) => `/explore/${id}`,
  /** A destination with one machine selected: its details open and the page jumps to it (US-3.2). */
  machine: (destinationId: DestinationId, machineId: string) =>
    `/explore/${destinationId}?machine=${encodeURIComponent(machineId)}#machine-${encodeURIComponent(machineId)}`,
  story: (storyId: string) => `/stories/${encodeURIComponent(storyId)}`,
  about: () => '/about',
} as const
