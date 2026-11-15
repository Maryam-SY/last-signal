import type { Machine, MachineDetail, Media, MissionDetail, Sourced } from '@/api/types'

/**
 * Pure helpers of the scroll journey on a destination page (mission → machine → what it did).
 * They only reorganise content that the API already serves: no text is invented here.
 */

export interface JourneyChapter {
  id: string
  /** Sourced date of the step, when the chapter comes from the mission timeline. */
  date: Sourced<string> | null
  title: string | null
  text: string
  media: Media
}

/** A moment of one machine's life page: its picture is optional (US-5.13). */
export interface LifeChapter {
  id: string
  date: Sourced<string> | null
  title: string | null
  text: string
  media?: Media
  /** The text is the picture's own caption (an extra picture of a chapter). */
  fromPicture?: boolean
}

/**
 * The machine's own chapters (US-5.13), each with the best picture of that moment among the
 * pictures of this machine; every other picture of the chapter follows as a moment of its own,
 * told by its caption, so the flight shows all of them. Empty when there is no biography yet.
 */
export function biographyChapters(machine: Pick<MachineDetail, 'media' | 'biography'>, shown: Set<string> = new Set()): LifeChapter[] {
  const byId = new Map(machine.media.map((item) => [item.id, item]))
  return (machine.biography?.chapters ?? []).flatMap((chapter) => {
    // A picture appears once on the page (US-5.14): skip those already shown (hero, portrait,
    // an earlier chapter); a moment keeps its text even when no picture is left for it.
    const pictures = chapter.mediaIds
      .map((id) => byId.get(id))
      .filter((item): item is Media => item !== undefined && isStill(item) && !shown.has(item.id))
    pictures.forEach((item) => shown.add(item.id))
    const lead = bestStill(pictures)
    const more = pictures.filter((item) => item !== lead)
    return [
      { id: chapter.id, date: chapter.date, title: chapter.title, text: chapter.text, media: lead },
      ...more.map((item) => ({ id: `${chapter.id}--${item.id}`, date: chapter.date, title: null, text: item.description ?? item.alt, media: item, fromPicture: true })),
    ]
  })
}

const isStill = (media: Media) => media.type === 'image' || media.type === 'animation'

/** Best picture among `media`: a real photo first, then any still image. */
export function bestStill(media: readonly Media[]): Media | undefined {
  const stills = media.filter(isStill)
  return stills.find((item) => item.depiction === 'photo') ?? stills[0]
}

/**
 * The picture that illustrates one moment of the mission log (US-5.10): the one whose story we
 * can tell (`description`), otherwise the first one.
 */
export function toldPicture(media: readonly Media[]): Media | undefined {
  return media.find((item) => item.description) ?? media[0]
}

/** What the mission log above already tells: its steps and the picture of each (US-5.9). */
export interface Told {
  eventIds: ReadonlySet<string>
  mediaIds: ReadonlySet<string>
}

export function mediaOfMachine(mission: MissionDetail, machineId: string): Media[] {
  return mission.media.filter((item) => item.machineIds.includes(machineId))
}

/** Photo of the mission's opening scene. */
export function missionCover(mission: MissionDetail): Media | undefined {
  return bestStill(mission.media)
}

/**
 * Photo of a machine on its stage: its best real photo, but not the one already shown for the
 * mission just above when the machine has another one (otherwise the same picture appears
 * twice and the machine itself is not shown). Real photos still win over drawings; among
 * photos, one of this machine alone and a still image are preferred.
 */
export function machineCover(mission: MissionDetail, machineId: string, avoid?: ReadonlySet<string>): Media | undefined {
  const stills = mediaOfMachine(mission, machineId).filter(isStill)
  // Preferences, in order: a photo of this machine alone rather than one shared with other
  // machines (two machines in a row would show the same picture), then a still photo rather
  // than an animation (lighter, and the stage animates it already). Content order otherwise.
  const rank = (item: Media) => (item.machineIds.length > 1 ? 2 : 0) + (item.type === 'animation' ? 1 : 0)
  const photos = stills.filter((item) => item.depiction === 'photo').sort((a, b) => rank(a) - rank(b))
  const opening = missionCover(mission)
  // `avoid`: pictures already told by the mission log (US-5.9) — used only if nothing else exists.
  return (
    photos.find((item) => item.id !== opening?.id && !avoid?.has(item.id)) ??
    photos.find((item) => item.id !== opening?.id) ??
    photos[0] ??
    stills[0]
  )
}

const MODEL_FILE = /\.(glb|gltf)$/i

/**
 * The NASA 3D model of a machine, when the content has one as a .glb/.gltf file (ADR-020).
 * Other "3d-model" media (embedded pages) are not shown in the viewer.
 */
export function modelOf(mission: MissionDetail, machineId: string): Media | undefined {
  return mediaOfMachine(mission, machineId).find((item) => {
    if (item.type !== '3d-model') return false
    try {
      return MODEL_FILE.test(new URL(item.url).pathname)
    } catch {
      return false
    }
  })
}

/**
 * What a machine did, in order: the steps of the mission timeline whose illustrations show this
 * machine (date, title and plain-language explanation are already sourced). Without such steps,
 * fall back to other photos of the machine, described by their alt text.
 */
export function machineChapters(
  machine: Machine,
  mission: MissionDetail,
  cover: Media | undefined,
  max = 4,
  told?: Told,
): JourneyChapter[] {
  // When the mission log already tells every step (US-5.9), a machine's scene only adds the
  // pictures of it that have their own story and were not shown yet — never a bare photo.
  if (told) {
    return mediaOfMachine(mission, machine.id)
      .filter((item) => isStill(item) && item.description && item.id !== cover?.id && !told.mediaIds.has(item.id))
      .slice(0, max - 1)
      .map((item) => ({ id: item.id, date: null, title: null, text: item.description!, media: item }))
  }

  const fromTimeline = mission.timeline.flatMap((event) => {
    const media = bestStill(event.media.filter((item) => item.machineIds.includes(machine.id)))
    return media ? [{ id: event.id, date: event.date, title: event.title, text: event.description, media }] : []
  })
  if (fromTimeline.length > 0) return fromTimeline.slice(0, max)

  return mediaOfMachine(mission, machine.id)
    .filter((item) => isStill(item) && item.id !== cover?.id)
    .slice(0, max - 1)
    .map((item) => ({ id: item.id, date: null, title: item.title, text: item.alt, media: item }))
}

