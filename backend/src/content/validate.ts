import {
  DESTINATION_IDS,
  LANGS,
  MACHINE_STATUSES,
  MACHINE_TYPES,
  MEDIA_TYPES,
  RELATION_TYPES,
  SOURCE_TYPES,
  STEP_KEYS,
  VOICES,
  type Content,
  type EntityRef,
  type LocalizedText,
  type Sourced,
} from './types.js'

export interface ValidationReport {
  errors: string[]
  warnings: string[]
}

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PARTIAL_DATE = /^\d{4}(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/
const FULL_DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

/**
 * Integrity rules V1–V12 from docs/architecture/DATA_MODEL.md §5.
 * Errors block startup and CI; warnings are reported but tolerated.
 */
export function validateContent(content: Content): ValidationReport {
  const errors: string[] = []
  const warnings: string[] = []
  const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`)

  const ids = <T extends { id: string }>(name: string, items: T[]) => {
    const set = new Set<string>()
    for (const item of items) {
      if (!KEBAB.test(item.id)) err(`${name}/${item.id}`, 'id must be kebab-case (V1)')
      if (set.has(item.id)) err(`${name}/${item.id}`, 'duplicate id (V1)')
      set.add(item.id)
    }
    return set
  }

  const destinationIds = ids('destinations', content.destinations)
  const missionIds = ids('missions', content.missions)
  const machineIds = ids('machines', content.machines)
  const relationIds = ids('relations', content.relations)
  const storyIds = ids('stories', content.stories)
  const sourceIds = ids('sources', content.sources)
  const mediaIds = ids('media', content.media)
  const citedSources = new Set<string>()

  const text = (where: string, value: LocalizedText | undefined, required = true) => {
    if (!value) {
      if (required) err(where, 'missing localized text')
      return
    }
    for (const lang of LANGS) {
      if (typeof value[lang] !== 'string' || value[lang].trim() === '') err(where, `missing "${lang}" text`)
    }
  }
  const sources = (where: string, list: string[] | undefined, min = 1) => {
    if (!Array.isArray(list) || list.length < min) {
      err(where, `needs at least ${min} source (V4)`)
      return
    }
    for (const id of list) {
      citedSources.add(id)
      if (!sourceIds.has(id)) err(where, `unknown source "${id}" (V3)`)
    }
  }
  const sourced = <T>(where: string, fact: Sourced<T> | null | undefined, check?: (v: T) => void) => {
    if (fact === null || fact === undefined) return
    sources(where, fact.sourceIds)
    if (fact.note) text(`${where}.note`, fact.note)
    check?.(fact.value)
  }
  const ref = (where: string, r: EntityRef) => {
    const known = r.kind === 'machine' ? machineIds : r.kind === 'mission' ? missionIds : null
    if (!known) err(where, `unknown entity kind "${String(r.kind)}"`)
    else if (!known.has(r.id)) err(where, `unknown ${r.kind} "${r.id}" (V3)`)
  }

  // Destinations
  for (const d of content.destinations) {
    if (!(DESTINATION_IDS as readonly string[]).includes(d.id)) err(`destinations/${d.id}`, 'only moon and mars are allowed (V2)')
    text(`destinations/${d.id}.name`, d.name)
    text(`destinations/${d.id}.intro`, d.intro)
  }

  // Missions
  for (const m of content.missions) {
    const w = `missions/${m.id}`
    if (!destinationIds.has(m.destinationId)) err(w, `unknown destination "${m.destinationId}" (V2/V3)`)
    text(`${w}.summary`, m.summary)
    sources(`${w}.sourceIds`, m.sourceIds)
    sourced(`${w}.period`, m.period, (p) => {
      if (!PARTIAL_DATE.test(p.start)) err(`${w}.period`, `invalid start date "${p.start}" (V11)`)
      if (p.end != null) {
        if (!PARTIAL_DATE.test(p.end)) err(`${w}.period`, `invalid end date "${p.end}" (V11)`)
        else if (p.end < p.start) err(`${w}.period`, 'end is before start (V11)')
      }
    })
    if (m.mainStoryId !== null) {
      const story = content.stories.find((s) => s.id === m.mainStoryId)
      if (!story) err(w, `unknown main story "${m.mainStoryId}" (V3)`)
      else if (!story.missionIds.includes(m.id)) err(w, `main story "${story.id}" does not list this mission (V10)`)
    }
    if (!content.machines.some((machine) => machine.missionId === m.id)) warnings.push(`${w}: mission has no machine`)
  }

  // Machines
  for (const m of content.machines) {
    const w = `machines/${m.id}`
    if (!missionIds.has(m.missionId)) err(w, `unknown mission "${m.missionId}" (V3)`)
    if (!(MACHINE_TYPES as readonly string[]).includes(m.type)) err(w, `unknown type "${m.type}"`)
    sourced(`${w}.date`, m.date, (v) => {
      if (!PARTIAL_DATE.test(v)) err(`${w}.date`, `invalid date "${v}" (V11)`)
    })
    sourced(`${w}.locationName`, m.locationName)
    sourced(`${w}.coordinates`, m.coordinates, (c) => {
      if (typeof c.lat !== 'number' || c.lat < -90 || c.lat > 90) err(`${w}.coordinates`, 'latitude out of [-90, 90] (V5)')
      if (typeof c.lon !== 'number' || c.lon < -180 || c.lon > 180) err(`${w}.coordinates`, 'longitude out of [-180, 180] east-positive (V5)')
    })
    if (!m.status) err(w, 'missing status')
    sourced(`${w}.status`, m.status, (s) => {
      if (!(MACHINE_STATUSES as readonly string[]).includes(s)) err(`${w}.status`, `unknown status "${s}" (DATA-006)`)
    })
    sourced(`${w}.scienceSummary`, m.scienceSummary, (t) => text(`${w}.scienceSummary`, t))
    if (!m.scienceSummary) warnings.push(`${w}: no science summary`)
    for (const id of m.storyIds) if (!storyIds.has(id)) err(w, `unknown story "${id}" (V3)`)
  }

  // Relations
  for (const r of content.relations) {
    const w = `relations/${r.id}`
    ref(`${w}.from`, r.from)
    ref(`${w}.to`, r.to)
    if (!(RELATION_TYPES as readonly string[]).includes(r.type)) err(w, `unknown type "${r.type}"`)
    text(`${w}.transmitted`, r.transmitted)
    text(`${w}.evidence`, r.evidence)
    sources(`${w}.sourceIds`, r.sourceIds)
  }

  // Stories
  for (const s of content.stories) {
    const w = `stories/${s.id}`
    text(`${w}.title`, s.title)
    if (!Array.isArray(s.missionIds) || s.missionIds.length === 0) err(w, 'needs at least one mission (V10)')
    for (const id of s.missionIds ?? []) if (!missionIds.has(id)) err(w, `unknown mission "${id}" (V3)`)
    for (const id of s.machineIds) if (!machineIds.has(id)) err(w, `unknown machine "${id}" (V3)`)
    if (s.kind === 'machine' && s.machineIds.length === 0) err(w, 'machine story needs a machine (V10)')
    if (s.status === 'draft') warnings.push(`${w}: draft — needs scientific review before publication`)
    const keys = s.steps.map((step) => step.key)
    if (keys.length !== STEP_KEYS.length || keys.some((k, i) => k !== STEP_KEYS[i])) {
      err(w, `steps must be exactly ${STEP_KEYS.join(' → ')} (V6)`)
    }
    for (const step of s.steps) {
      const ws = `${w}/${step.key}`
      text(`${ws}.title`, step.title)
      if (step.blocks.length === 0) err(ws, 'step has no block')
      if (step.relationIds?.length && step.key !== 'relay') err(ws, 'relationIds are only allowed in the relay step (V7)')
      for (const id of step.relationIds ?? []) if (!relationIds.has(id)) err(ws, `unknown relation "${id}" (V3)`)
      step.blocks.forEach((b, i) => {
        const wb = `${ws}[${i}]`
        if (!(VOICES as readonly string[]).includes(b.voice)) err(wb, `unknown voice "${b.voice}"`)
        text(`${wb}.text`, b.text)
        if (b.voice === 'data') sources(wb, b.sourceIds)
        else for (const id of b.sourceIds) {
          citedSources.add(id)
          if (!sourceIds.has(id)) err(wb, `unknown source "${id}" (V3)`)
        }
        if (b.voice === 'interpretation' && b.sourceIds.length === 0) warnings.push(`${wb}: interpretation without source`)
        for (const id of b.mediaIds ?? []) if (!mediaIds.has(id)) err(wb, `unknown media "${id}" (V3)`)
      })
    }
  }

  // Sources
  for (const s of content.sources) {
    const w = `sources/${s.id}`
    if (!s.organization?.trim() || !s.title?.trim()) err(w, 'organization and title are required (V9)')
    if (!/^https?:\/\//.test(s.url)) err(w, 'url must be http(s) (V9)')
    else if (!s.url.startsWith('https://')) warnings.push(`${w}: url is not https`)
    if (!FULL_DATE.test(s.accessedOn)) err(w, `invalid accessedOn "${s.accessedOn}" (V9)`)
    if (s.publishedOn !== null && !FULL_DATE.test(s.publishedOn)) err(w, `invalid publishedOn "${s.publishedOn}" (V9)`)
    if (!(SOURCE_TYPES as readonly string[]).includes(s.type)) err(w, `unknown type "${s.type}"`)
    if (s.note) text(`${w}.note`, s.note)
  }

  // Media
  for (const m of content.media) {
    const w = `media/${m.id}`
    if (!(MEDIA_TYPES as readonly string[]).includes(m.type)) err(w, `unknown type "${m.type}"`)
    if (!/^https?:\/\//.test(m.url) || !/^https?:\/\//.test(m.pageUrl)) err(w, 'url and pageUrl must be http(s)')
    text(`${w}.alt`, m.alt)
    if (!m.license?.trim()) err(w, 'license is required (V12)')
    if (!m.credit) warnings.push(`${w}: no credit shown on the source page`)
    if (!sourceIds.has(m.sourceId)) err(w, `unknown source "${m.sourceId}" (V3)`)
    citedSources.add(m.sourceId)
    if (m.missionIds.length === 0) err(w, 'needs at least one mission')
    for (const id of m.missionIds) if (!missionIds.has(id)) err(w, `unknown mission "${id}" (V3)`)
    for (const id of m.machineIds) if (!machineIds.has(id)) err(w, `unknown machine "${id}" (V3)`)
    if (m.thumbnailUrl != null && !/^https?:\/\//.test(m.thumbnailUrl)) err(w, 'thumbnailUrl must be http(s)')
    if (m.dateCreated != null && !FULL_DATE.test(m.dateCreated)) err(w, `invalid dateCreated "${m.dateCreated}"`)
  }

  for (const id of sourceIds) if (!citedSources.has(id)) warnings.push(`sources/${id}: never cited`)

  return { errors, warnings }
}
