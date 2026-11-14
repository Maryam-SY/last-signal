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
  /** Key steps of the mission, oldest first, explained in plain language. */
  timeline: TimelineEvent[]
}

/** One dated step of a mission (launch, landing, discovery, end…). */
export interface TimelineEvent {
  id: string
  /** The date is a fact: it is sourced like any other. */
  date: Sourced<string>
  title: LocalizedText
  /** Plain-language explanation for a general audience (10–15 year olds first). */
  description: LocalizedText
  /** Illustrations; each must be linked to this mission. */
  mediaIds: string[]
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

/**
 * - photo: real photograph or real footage (including GIFs built from real camera frames)
 * - artwork: artist's concept, illustration, poster — NOT a photo
 * - simulation: computer-generated image, animation, 3D model or software screenshot — NOT a photo
 * - diagram: map, infographic, labelled diagram, chart
 * - mixed: combines real footage with drawings or animation (most edited videos, not checked frame by frame)
 * - document: report or PDF
 */
export const DEPICTIONS = ['photo', 'artwork', 'simulation', 'diagram', 'mixed', 'document'] as const
export type Depiction = (typeof DEPICTIONS)[number]

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
  /**
   * What the media really shows. The frontend MUST display a visible label for anything other
   * than "photo" or "document" (e.g. "Artist's view — not a photo"), so that a drawing or a
   * simulation is never mistaken for evidence (CDC §8, CLAUDE.md §7).
   */
  depiction: Depiction
  /**
   * The story behind the picture, for a general audience (US-5.10): restates only what the
   * media's own caption says. Shown next to the picture in the mission log.
   */
  description?: LocalizedText
  /** Required with `description`: only a human reviewer may set "reviewed" (CLAUDE.md §7). */
  descriptionStatus?: 'draft' | 'reviewed'
  /** Small preview image (NASA Image and Video Library items), when available. */
  thumbnailUrl?: string | null
  /** NASA Image and Video Library identifier, when the media comes from it. */
  nasaId?: string
  dateCreated?: string | null
}

/**
 * A word a 10–15 year old may not know, explained in one or two sentences taken from the
 * stories' own wording and sourced like them. Shown next to the story steps that use it.
 */
export interface GlossaryEntry {
  id: string
  status: 'draft' | 'reviewed'
  /** Forms of the word as they appear in the story texts, per language (case-insensitive). */
  terms: { en: string[]; fr: string[] }
  label: LocalizedText
  definition: LocalizedText
  sourceIds: string[]
}

export interface Content {
  destinations: Destination[]
  missions: Mission[]
  machines: Machine[]
  relations: Relation[]
  stories: Story[]
  sources: Source[]
  media: Media[]
  glossary: GlossaryEntry[]
}
