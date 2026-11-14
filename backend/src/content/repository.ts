import type { Content, EntityRef, Machine, Media, Mission, Relation, Source, Story } from './types.js'

export interface StorySummary {
  id: string
  title: Story['title']
  status: Story['status']
  missionIds: string[]
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
    }
  }

  getMachine(id: string) {
    const machine = this.machines.get(id)
    if (!machine) return null
    const mission = this.missions.get(machine.missionId) ?? null
    return {
      ...machine,
      destinationId: mission?.destinationId ?? null,
      mission: mission ? { id: mission.id, name: mission.name, destinationId: mission.destinationId } : null,
      relations: [...this.relationsOf({ kind: 'machine', id }), ...(mission ? this.relationsOf({ kind: 'mission', id: mission.id }) : [])],
      media: this.listMedia({ machineId: id }),
      // STORY-003: the machine's own story first, otherwise its mission's main story.
      storyTarget: this.summary(this.stories.get(machine.storyIds[0] ?? mission?.mainStoryId ?? '')),
      sources: this.sourcesCitedBy(machine),
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
    const relations = this.content.relations.filter((r) => relationIds.has(r.id))
    return {
      ...story,
      relations,
      media: [...mediaIds].map((mid) => this.media.get(mid)).filter((m): m is Media => m !== undefined),
      sources: this.sourcesCitedBy({ story, relations }),
    }
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

  private machinesOf(missionId: string): Machine[] {
    return this.content.machines.filter((m) => m.missionId === missionId)
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
