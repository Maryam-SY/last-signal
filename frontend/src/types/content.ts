/**
 * Content model types — see docs/architecture/DATA_MODEL.md.
 * Only the destination identifiers are needed for routing at this stage; the rest of the
 * model (Mission, Machine, Story, Source…) is added with US-1.5.
 */

/** Active destinations (DATA-005). Adding one is a scope decision (SCOPE.md). */
export const DESTINATION_IDS = ['moon', 'mars'] as const

export type DestinationId = (typeof DESTINATION_IDS)[number]

export function isDestinationId(value: unknown): value is DestinationId {
  return typeof value === 'string' && (DESTINATION_IDS as readonly string[]).includes(value)
}
