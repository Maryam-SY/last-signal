/**
 * Content model — see docs/architecture/DATA_MODEL.md.
 * All editorial text is bilingual (LocalizedText); proper names stay as plain strings.
 */

export const LANGS = ['en', 'fr'] as const
export type Lang = (typeof LANGS)[number]

export interface LocalizedText {
  en: string
  fr: string
}

/** A displayed fact: always tied to at least one source (SOURCE-001). */
export interface Sourced<T> {
  value: T
  sourceIds: string[]
  note?: LocalizedText
}

export const DESTINATION_IDS = ['moon', 'mars'] as const
export type DestinationId = (typeof DESTINATION_IDS)[number]

export interface Destination {
  id: DestinationId
  name: LocalizedText
  kind: 'natural-satellite' | 'planet'
  intro: LocalizedText
  order: number
}

export interface Period {
  start: string
  end?: string | null
}

export interface Mission {
  id: string
  name: string
  destinationId: DestinationId
  agency: string[]
  nssdcaIds: string[]
  period: Sourced<Period> | null
  summary: LocalizedText
  mainStoryId: string | null
  sourceIds: string[]
  order: number
}

export const MACHINE_STATUSES = ['operational', 'contact-lost', 'inactive', 'mission-ended', 'unknown'] as const
export type MachineStatus = (typeof MACHINE_STATUSES)[number]

export const MACHINE_TYPES = ['lander', 'rover', 'descent-stage', 'experiment', 'helicopter', 'impactor', 'other'] as const
export type MachineType = (typeof MACHINE_TYPES)[number]

export interface Coordinates {
  lat: number
  lon: number
}

export interface Machine {
  id: string
  name: string
  missionId: string
  type: MachineType
  nssdcaId: string | null
  date: Sourced<string> | null
  dateLabel?: 'landing' | 'deployment' | 'impact' | 'last-contact'
  locationName: Sourced<string> | null
  coordinates: Sourced<Coordinates> | null
  status: Sourced<MachineStatus>
  scienceSummary: Sourced<LocalizedText> | null
  storyIds: string[]
}

export const RELATION_TYPES = ['method', 'technology', 'data', 'knowledge', 'inspiration'] as const
export type RelationType = (typeof RELATION_TYPES)[number]

export interface EntityRef {
  kind: 'machine' | 'mission'
  id: string
}

export interface Relation {
  id: string
  from: EntityRef
  to: EntityRef
  type: RelationType
  transmitted: LocalizedText
  evidence: LocalizedText
  sourceIds: string[]
  showOnMap: boolean
}

export const STEP_KEYS = ['signal', 'why', 'how', 'discovery', 'relay', 'your-turn'] as const
export type StepKey = (typeof STEP_KEYS)[number]

export const VOICES = ['data', 'interpretation', 'imagination'] as const
export type Voice = (typeof VOICES)[number]

export interface StoryBlock {
  voice: Voice
  text: LocalizedText
  sourceIds: string[]
  mediaIds?: string[]
}

export interface StoryStep {
  key: StepKey
  title: LocalizedText
  blocks: StoryBlock[]
  relationIds?: string[]
}

export interface Story {
  id: string
  kind: 'mission' | 'machine'
  /** Missions this story belongs to (a story may span two missions, e.g. Surveyor 3 + Apollo 12). */
  missionIds: string[]
  machineIds: string[]
  title: LocalizedText
  status: 'draft' | 'reviewed'
  steps: StoryStep[]
}

export const SOURCE_TYPES = ['nssdca', 'nasa-mission-page', 'nasa-news', 'press', 'paper', 'other'] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

export interface Source {
  id: string
  organization: string
  title: string
  url: string
  type: SourceType
  publishedOn: string | null
  accessedOn: string
  note?: LocalizedText
}

export const MEDIA_TYPES = ['image', 'animation', 'video', '3d-model', 'document'] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

/** A reference to an external media file (not stored in the repository). */
export interface Media {
  id: string
  type: MediaType
  url: string
  pageUrl: string
  title: string | null
  /** Caption copied verbatim from the source page (English), or null if none is shown. */
  caption: string | null
  alt: LocalizedText
  credit: string | null
  license: string
  missionIds: string[]
  machineIds: string[]
  sourceId: string
  aiGenerated: boolean
}

export interface Content {
  destinations: Destination[]
  missions: Mission[]
  machines: Machine[]
  relations: Relation[]
  stories: Story[]
  sources: Source[]
  media: Media[]
}
