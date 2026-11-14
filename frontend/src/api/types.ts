/**
 * Response shapes of the AeroReborn API (backend/src/routes/content.ts), already localized:
 * every bilingual text arrives as a plain string for the requested language.
 * Contract: docs/architecture/ARCHITECTURE.md §16.
 */
import type { DestinationId } from '@/types/content'

export type Lang = 'en' | 'fr'

export interface Sourced<T> {
  value: T
  sourceIds: string[]
  note?: string
}

export type MachineStatus = 'operational' | 'contact-lost' | 'inactive' | 'mission-ended' | 'unknown'
export type MachineType = 'lander' | 'rover' | 'descent-stage' | 'experiment' | 'helicopter' | 'impactor' | 'other'
export type MediaType = 'image' | 'animation' | 'video' | '3d-model' | 'document'
export type Depiction = 'photo' | 'artwork' | 'simulation' | 'diagram' | 'mixed' | 'document'
export type Voice = 'data' | 'interpretation' | 'imagination'
export type StepKey = 'signal' | 'why' | 'how' | 'discovery' | 'relay' | 'your-turn'

export interface Source {
  id: string
  organization: string
  title: string
  url: string
  type: string
  publishedOn: string | null
  accessedOn: string
  note?: string
}

export interface Media {
  id: string
  type: MediaType
  url: string
  thumbnailUrl?: string | null
  pageUrl: string
  title: string | null
  caption: string | null
  alt: string
  credit: string | null
  license: string
  depiction: Depiction
  description?: string
  missionIds: string[]
  machineIds: string[]
  sourceId: string
}

export interface StorySummary {
  id: string
  title: string
  status: 'draft' | 'reviewed'
  missionIds: string[]
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
  coordinates: Sourced<{ lat: number; lon: number }> | null
  status: Sourced<MachineStatus>
  scienceSummary: Sourced<string> | null
  storyIds: string[]
}

export interface TimelineEvent {
  id: string
  date: Sourced<string>
  title: string
  description: string
  mediaIds: string[]
}

export interface Mission {
  id: string
  name: string
  destinationId: DestinationId
  agency: string[]
  nssdcaIds: string[]
  period: Sourced<{ start: string; end?: string | null }> | null
  summary: string
  mainStoryId: string | null
  sourceIds: string[]
  order: number
  timeline: TimelineEvent[]
}

/** One end of a relation, named by the API (machine and story details). */
export interface EntityLabel {
  kind: 'machine' | 'mission'
  id: string
  name: string
  destinationId: DestinationId | null
}

export interface Relation {
  id: string
  from: { kind: 'machine' | 'mission'; id: string }
  to: { kind: 'machine' | 'mission'; id: string }
  type: string
  transmitted: string
  evidence: string
  sourceIds: string[]
  /** Present on GET /api/machines/:id and /api/stories/:id. */
  fromEntity?: EntityLabel | null
  toEntity?: EntityLabel | null
}

export interface DestinationSummary {
  id: DestinationId
  name: string
  kind: 'natural-satellite' | 'planet'
  intro: string
  order: number
  missionCount: number
  machineCount: number
}

export interface DestinationDetail extends DestinationSummary {
  missions: (Mission & { machines: Machine[]; mainStory: StorySummary | null })[]
}

export interface MissionDetail extends Omit<Mission, 'timeline'> {
  timeline: (TimelineEvent & { media: Media[] })[]
  machines: Machine[]
  stories: StorySummary[]
  relations: Relation[]
  media: Media[]
}

export interface MachineDetail extends Machine {
  destinationId: DestinationId | null
  mission: { id: string; name: string; destinationId: DestinationId } | null
  relations: Relation[]
  media: Media[]
  storyTarget: StorySummary | null
  sources: Source[]
}

export interface StoryBlock {
  voice: Voice
  text: string
  sourceIds: string[]
  mediaIds?: string[]
}

export interface StoryStep {
  key: StepKey
  title: string
  blocks: StoryBlock[]
  relationIds?: string[]
}

export interface StoryDetail {
  id: string
  kind: 'mission' | 'machine'
  missionIds: string[]
  machineIds: string[]
  title: string
  status: 'draft' | 'reviewed'
  steps: StoryStep[]
  destinationId: DestinationId | null
  missions: { id: string; name: string; destinationId: DestinationId }[]
  /** Machines cited by the story (STORY-008), with the destination where each one is. */
  machines: { id: string; name: string; destinationId: DestinationId | null }[]
  relations: Relation[]
  media: Media[]
  sources: Source[]
}
