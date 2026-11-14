import type { Content, EntityRef, GlossaryEntry, Machine, Media, Mission, Relation, Source, Story } from './types.js'

export interface StorySummary {
  id: string
  title: Story['title']
  status: Story['status']
  missionIds: string[]
}

/** One end of a relation, named so that the interface never shows a bare id. */
export interface EntityLabel {
  kind: EntityRef['kind']
  id: string
  name: string
  destinationId: Mission['destinationId'] | null
}

/** A relation with its two ends named (no extra request needed to say "from … to …"). */
export type NamedRelation = Relation & { fromEntity: EntityLabel | null; toEntity: EntityLabel | null }

/** A machine as listed in a gallery, with the photo that represents it (US-5.7). */
export type MachineSummary = Machine & { cover: Media | null }

/** One dated machine on the Moon + Mars timeline (US-5.8): only sourced dates. */
export interface TimelineEntry {
  machineId: string
  name: string
  missionId: string
  missionName: string
  destinationId: Mission['destinationId']
  date: NonNullable<Machine['date']>
  dateLabel: Machine['dateLabel'] | null
  status: Machine['status']
}

export interface MediaFilter {
  missionId?: string
  machineId?: string
  type?: string
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order

/** Read-only queries over the validated content, with O(1) lookups by id. */
export class ContentRepository {
  private readonly missions = new Map<string, Mission>()
  private readonly machines = new Map<string, Machine>()
  private readonly stories = new Map<string, Story>()
  private readonly sources = new Map<string, Source>()
  private readonly media = new Map<string, Media>()

  constructor(private readonly content: Content) {
    for (const m of content.missions) this.missions.set(m.id, m)
    for (const m of content.machines) this.machines.set(m.id, m)
    for (const s of content.stories) this.stories.set(s.id, s)
    for (const s of content.sources) this.sources.set(s.id, s)
    for (const m of content.media) this.media.set(m.id, m)
  }

  listDestinations() {
    return [...this.content.destinations].sort(byOrder).map((destination) => {
      const missions = this.content.missions.filter((m) => m.destinationId === destination.id)
      const machineCount = this.content.machines.filter((m) => missions.some((mission) => mission.id === m.missionId)).length
      return { ...destination, missionCount: missions.length, machineCount }
    })
  }

  getDestination(id: string) {
    const destination = this.listDestinations().find((d) => d.id === id)
    if (!destination) return null
    const missions = this.content.missions
      .filter((m) => m.destinationId === id)
      .sort(byOrder)
      .map((mission) => ({
        ...mission,
        machines: this.machinesOf(mission.id),
        mainStory: mission.mainStoryId ? this.summary(this.stories.get(mission.mainStoryId)) : null,
      }))
    return { ...destination, missions }
  }

  getMission(id: string) {
    const mission = this.missions.get(id)
    if (!mission) return null
    return {
      ...mission,
      // Each timeline step comes with its illustrations resolved, ready to display.
      timeline: mission.timeline.map((event) => ({
        ...event,
        media: event.mediaIds.map((mid) => this.media.get(mid)).filter((m): m is Media => m !== undefined),
      })),
      machines: this.machinesOf(id),
      stories: this.content.stories.filter((s) => s.missionIds.includes(id)).map((s) => this.summary(s)),
      relations: this.relationsOf({ kind: 'mission', id }),
      media: this.listMedia({ missionId: id }),
      // Shown under the mission's step-by-step log, without another request (US-5.9).
      sources: this.sourcesCitedBy(mission),
    }
  }

  getMachine(id: string) {
    const machine = this.machines.get(id)
    if (!machine) return null
    const mission = this.missions.get(machine.missionId) ?? null
    const relations = [
      ...this.relationsOf({ kind: 'machine', id }),
      ...(mission ? this.relationsOf({ kind: 'mission', id: mission.id }) : []),
    ].map((relation) => this.named(relation))
    return {
      ...machine,
      destinationId: mission?.destinationId ?? null,
      mission: mission ? { id: mission.id, name: mission.name, destinationId: mission.destinationId } : null,
      relations,
      media: this.listMedia({ machineId: id }),
      // STORY-003: the machine's own story first, otherwise its mission's main story.
      storyTarget: this.summary(this.stories.get(machine.storyIds[0] ?? mission?.mainStoryId ?? '')),
      // The relations shown with the machine cite sources too: resolve them with the machine's own.
      sources: this.sourcesCitedBy({ machine, relations }),
    }
  }

  listStories(): StorySummary[] {
    return this.content.stories.map((s) => this.summary(s)).filter((s): s is StorySummary => s !== null)
  }

  getStory(id: string) {
    const story = this.stories.get(id)
    if (!story) return null
    const mediaIds = new Set(story.steps.flatMap((step) => step.blocks.flatMap((b) => b.mediaIds ?? [])))
    const relationIds = new Set(story.steps.flatMap((step) => step.relationIds ?? []))
    const relations = this.content.relations.filter((r) => relationIds.has(r.id)).map((r) => this.named(r))
    const firstMission = this.missions.get(story.missionIds[0] ?? '')
    return {
      ...story,
      // Lets the interface offer "back to the Moon / Mars" without another request.
      destinationId: firstMission?.destinationId ?? null,
      missions: story.missionIds
        .map((mid) => this.missions.get(mid))
        .filter((m): m is Mission => m !== undefined)
        .map((m) => ({ id: m.id, name: m.name, destinationId: m.destinationId })),
      // STORY-008: "machines in this story" at the end, with the destination where each one is.
      machines: story.machineIds
        .map((mid) => this.label({ kind: 'machine', id: mid }))
        .filter((m): m is EntityLabel => m !== null)
        .map(({ id: machineId, name, destinationId }) => ({ id: machineId, name, destinationId })),
      relations,
      media: [...mediaIds].map((mid) => this.media.get(mid)).filter((m): m is Media => m !== undefined),
      // Opening image of the story: the first real photo it shows (never a drawing).
      cover: this.firstPhoto([...mediaIds].map((mid) => this.media.get(mid)).filter((m): m is Media => m !== undefined)),
      sources: this.sourcesCitedBy({ story, relations }),
    }
  }

  /** Words explained next to the story steps (V14), with their sources resolved. */
  listGlossary(): Array<GlossaryEntry & { sources: Source[] }> {
    return this.content.glossary.map((entry) => ({ ...entry, sources: this.sourcesCitedBy(entry) }))
  }

  /** Every machine with a sourced date, on both worlds, oldest first (US-5.8). */
  getTimeline(): TimelineEntry[] {
    return this.content.machines
      .flatMap((machine) => {
        const mission = this.missions.get(machine.missionId)
        if (!machine.date || !mission) return []
        return [
          {
            machineId: machine.id,
            name: machine.name,
            missionId: mission.id,
            missionName: mission.name,
            destinationId: mission.destinationId,
            date: machine.date,
            dateLabel: machine.dateLabel ?? null,
            status: machine.status,
          },
        ]
      })
      .sort((a, b) => a.date.value.localeCompare(b.date.value) || a.name.localeCompare(b.name))
  }

  listSources(): Source[] {
    return this.content.sources
  }

  getSource(id: string) {
    return this.sources.get(id) ?? null
  }

  listRelations(): Relation[] {
    return this.content.relations
  }

  listMedia(filter: MediaFilter = {}): Media[] {
    return this.content.media.filter(
      (m) =>
        (!filter.missionId || m.missionIds.includes(filter.missionId)) &&
        (!filter.machineId || m.machineIds.includes(filter.machineId)) &&
        (!filter.type || m.type === filter.type),
    )
  }

  private label(ref: EntityRef): EntityLabel | null {
    if (ref.kind === 'mission') {
      const mission = this.missions.get(ref.id)
      return mission ? { kind: 'mission', id: mission.id, name: mission.name, destinationId: mission.destinationId } : null
    }
    const machine = this.machines.get(ref.id)
    if (!machine) return null
    return { kind: 'machine', id: machine.id, name: machine.name, destinationId: this.missions.get(machine.missionId)?.destinationId ?? null }
  }

  private named(relation: Relation): NamedRelation {
    return { ...relation, fromEntity: this.label(relation.from), toEntity: this.label(relation.to) }
  }

  private machinesOf(missionId: string): MachineSummary[] {
    return this.content.machines
      .filter((m) => m.missionId === missionId)
      .map((machine) => ({ ...machine, cover: this.firstPhoto(this.listMedia({ machineId: machine.id })) }))
  }

  /** First real photograph (still image) of a list: covers are never drawings or simulations. */
  private firstPhoto(media: Media[]): Media | null {
    return media.find((m) => m.type === 'image' && m.depiction === 'photo') ?? null
  }

  private relationsOf(ref: EntityRef): Relation[] {
    const same = (r: EntityRef) => r.kind === ref.kind && r.id === ref.id
    return this.content.relations.filter((r) => same(r.from) || same(r.to))
  }

  private summary(story: Story | undefined): StorySummary | null {
    return story ? { id: story.id, title: story.title, status: story.status, missionIds: story.missionIds } : null
  }

  /** Every source referenced anywhere inside `value` (any `sourceIds` array), resolved. */
  private sourcesCitedBy(value: unknown): Source[] {
    const ids = new Set<string>()
    const walk = (node: unknown) => {
      if (Array.isArray(node)) node.forEach(walk)
      else if (node && typeof node === 'object') {
        for (const [key, item] of Object.entries(node)) {
          if (key === 'sourceIds' && Array.isArray(item)) item.forEach((id) => ids.add(String(id)))
          else walk(item)
        }
      }
    }
    walk(value)
    return [...ids].map((id) => this.sources.get(id)).filter((s): s is Source => s !== undefined)
  }
}
