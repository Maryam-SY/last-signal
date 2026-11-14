/**
 * Content types as the frontend receives them, derived from the backend (single source of
 * truth: backend/src/content/). Type-only imports (ADR-019): nothing from the backend reaches
 * the browser bundle. `Localized<T>` turns every { en, fr } text into the string of `?lang=`.
 */
import type { Localized } from '@backend/content/localize'
import type { ContentRepository, EntitySummary as BackendEntity } from '@backend/content/repository'
import type * as Backend from '@backend/content/types'

type Payload<K extends keyof ContentRepository> = ContentRepository[K] extends (...args: never[]) => infer R
  ? Localized<NonNullable<R>>
  : never

export type DestinationId = Backend.DestinationId
export type MachineStatus = Backend.MachineStatus
export type MachineType = Backend.MachineType
export type RelationType = Backend.RelationType
export type Voice = Backend.Voice
export type Depiction = Backend.Depiction
export type MediaType = Backend.MediaType
export type Coordinates = Backend.Coordinates
export type Sourced<T> = Localized<Backend.Sourced<T>>

export type Source = Localized<Backend.Source>
export type Media = Localized<Backend.Media>
export type Machine = Localized<Backend.Machine>
export type EntitySummary = BackendEntity

/** GET /api/destinations/:id */
export type DestinationDetail = Payload<'getDestination'>
export type MissionWithMachines = DestinationDetail['missions'][number]
/** GET /api/missions/:id */
export type MissionDetail = Payload<'getMission'>
export type TimelineEvent = MissionDetail['timeline'][number]
/** GET /api/machines/:id */
export type MachineDetailData = Payload<'getMachine'>
export type NamedRelation = MachineDetailData['relations'][number]
/** GET /api/stories/:id */
export type StoryDetail = Payload<'getStory'>
export type StoryStep = StoryDetail['steps'][number]
export type StoryBlock = StoryStep['blocks'][number]
export type StorySummary = Payload<'listStories'>[number]

/** Active destinations (DATA-005). Kept at runtime so the router rejects unknown ids early. */
export const DESTINATION_IDS = ['moon', 'mars'] as const satisfies readonly DestinationId[]

export function isDestinationId(value: unknown): value is DestinationId {
  return typeof value === 'string' && (DESTINATION_IDS as readonly string[]).includes(value)
}
