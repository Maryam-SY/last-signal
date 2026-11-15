import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp, InvalidContentError } from '../app.js'
import { loadContent } from '../content/load.js'

const app = createApp()

describe('content API', () => {
  it('GET /api/destinations lists the Moon then Mars with computed counts', async () => {
    const res = await request(app).get('/api/destinations')
    expect(res.status).toBe(200)
    expect(res.body.map((d: { id: string }) => d.id)).toEqual(['moon', 'mars'])
    expect(res.body[0]).toMatchObject({ name: 'Moon', missionCount: 3, machineCount: 6 })
    expect(res.body[1]).toMatchObject({ name: 'Mars', missionCount: 3, machineCount: 5 })
  })

  it('localizes every text with ?lang=fr', async () => {
    const res = await request(app).get('/api/destinations/moon?lang=fr')
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Lune')
    expect(typeof res.body.missions[0].summary).toBe('string')
    expect(JSON.stringify(res.body)).not.toContain('"fr":')
  })

  it('falls back to English for an unsupported language', async () => {
    const res = await request(app).get('/api/destinations/moon?lang=de')
    expect(res.body.name).toBe('Moon')
  })

  it('GET /api/destinations/:id groups machines by mission, in order', async () => {
    const res = await request(app).get('/api/destinations/mars')
    expect(res.body.missions.map((m: { id: string }) => m.id)).toEqual([
      'mars-pathfinder',
      'mars-exploration-rovers',
      'mars-2020',
    ])
    const mer = res.body.missions[1]
    expect(mer.machines.map((m: { id: string }) => m.id)).toEqual(['spirit', 'opportunity'])
    expect(mer.mainStory).toMatchObject({ id: 'mars-spirit-opportunity', status: 'draft' })
  })

  it('returns 404 for an unknown destination', async () => {
    const res = await request(app).get('/api/destinations/pluto')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Destination not found' })
  })

  it('GET /api/machines/:id resolves mission, story, relations, media and sources', async () => {
    const res = await request(app).get('/api/machines/surveyor-3-lander')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      destinationId: 'moon',
      mission: { id: 'surveyor-3' },
      storyTarget: { id: 'moon-surveyor-apollo12' },
      coordinates: { value: { lat: -3.0162, lon: -23.418 } },
    })
    expect(res.body.relations.map((r: { id: string }) => r.id)).toContain('surveyor-3-to-apollo-12-data')
    expect(res.body.media.length).toBeGreaterThan(0)
    expect(res.body.sources.map((s: { id: string }) => s.id)).toContain('nssdca-1967-035a')
  })

  it('keeps coordinates null when no reliable position is published', async () => {
    const res = await request(app).get('/api/machines/ingenuity')
    expect(res.body.coordinates).toBeNull()
    expect(res.body.storyTarget).toMatchObject({ id: 'mars-ingenuity' })
  })

  it('GET /api/stories/:id returns the six steps with their sources and media', async () => {
    const res = await request(app).get('/api/stories/mars-spirit-opportunity?lang=fr')
    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Les jumeaux qui ont dépassé toutes les attentes')
    expect(res.body.steps.map((s: { key: string }) => s.key)).toEqual([
      'signal',
      'why',
      'how',
      'discovery',
      'relay',
      'your-turn',
    ])
    expect(res.body.relations.map((r: { id: string }) => r.id)).toEqual([
      'pathfinder-to-mer-airbags',
      'mer-to-mars-2020-technology',
    ])
    expect(res.body.sources.length).toBeGreaterThan(0)
    expect(res.body.media.length).toBeGreaterThan(0)
  })

  it('GET /api/stories lists summaries', async () => {
    const res = await request(app).get('/api/stories')
    expect(res.body).toHaveLength(4)
  })

  it('GET /api/media filters by type and mission', async () => {
    const videos = await request(app).get('/api/media?type=video')
    expect(videos.body.length).toBeGreaterThanOrEqual(5)
    expect(videos.body.every((m: { type: string }) => m.type === 'video')).toBe(true)
    const apollo12 = await request(app).get('/api/media?missionId=apollo-12')
    expect(apollo12.body.length).toBeGreaterThan(0)
    expect(apollo12.body.every((m: { missionIds: string[] }) => m.missionIds.includes('apollo-12'))).toBe(true)
    const ingenuity = await request(app).get('/api/media?missionId=mars-2020&type=3d-model')
    expect(ingenuity.body.map((m: { id: string }) => m.id)).toEqual(['ingenuity-3d-model'])
  })

  it('rejects an unknown media type', async () => {
    const res = await request(app).get('/api/media?type=hologram')
    expect(res.status).toBe(400)
  })

  it('GET /api/sources lists every source with its consultation date', async () => {
    const res = await request(app).get('/api/sources')
    expect(res.body.length).toBeGreaterThan(0)
    for (const s of res.body) expect(s.accessedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('refuses to start with invalid content', () => {
    const broken = loadContent()
    broken.machines[0]!.status.sourceIds = []
    expect(() => createApp({ content: broken })).toThrow(InvalidContentError)
  })

  it('GET /api/missions/:id returns the timeline with its illustrations resolved', async () => {
    const res = await request(app).get('/api/missions/mars-2020?lang=fr')
    expect(res.status).toBe(200)
    const firstFlight = res.body.timeline.find((e: { id: string }) => e.id === 'first-flight')
    expect(firstFlight).toMatchObject({ date: { value: '2021-04-19' }, title: 'Premier vol sur une autre planète' })
    expect(firstFlight.media.length).toBeGreaterThan(0)
    expect(firstFlight.media[0]).toHaveProperty('depiction')
    // The sources of the mission and of every dated step are resolved.
    const sourceIds = new Set(res.body.sources.map((s: { id: string }) => s.id))
    for (const event of res.body.timeline) for (const id of event.date.sourceIds) expect(sourceIds.has(id)).toBe(true)
    expect(typeof firstFlight.media[0].alt).toBe('string')
  })

  it('GET /api/stories/:id names the machines it cites and both ends of each relation', async () => {
    const res = await request(app).get('/api/stories/moon-surveyor-apollo12')
    expect(res.status).toBe(200)
    expect(res.body.machines).toContainEqual({ id: 'surveyor-3-lander', name: expect.any(String), destinationId: 'moon' })
    const relation = res.body.relations.find((r: { id: string }) => r.id === 'surveyor-3-to-apollo-12-data')
    expect(relation.fromEntity).toMatchObject({ kind: 'machine', id: 'surveyor-3-lander', destinationId: 'moon' })
    expect(relation.toEntity).toMatchObject({ kind: 'mission', id: 'apollo-12', name: 'Apollo 12' })
  })

  it('gives each machine of a destination a real photo as cover, never a drawing (US-5.7)', async () => {
    const res = await request(app).get('/api/destinations/moon')
    const machines = res.body.missions.flatMap((m: { machines: unknown[] }) => m.machines) as {
      id: string
      cover: { type: string; depiction: string; machineIds: string[] } | null
    }[]
    expect(machines.length).toBeGreaterThan(0)
    for (const machine of machines) {
      if (!machine.cover) continue
      expect(machine.cover).toMatchObject({ type: 'image', depiction: 'photo' })
      expect(machine.cover.machineIds).toContain(machine.id)
    }
    expect(machines.some((m) => m.cover !== null)).toBe(true)
  })

  it('gives a story a photo cover taken from its own media', async () => {
    const res = await request(app).get('/api/stories/moon-apollo11-retroreflectors')
    expect(res.body.cover).toMatchObject({ type: 'image', depiction: 'photo' })
    expect(res.body.media.map((m: { id: string }) => m.id)).toContain(res.body.cover.id)
  })

  it('GET /api/glossary returns sourced, localized definitions (V14)', async () => {
    const res = await request(app).get('/api/glossary?lang=fr')
    expect(res.status).toBe(200)
    const seismometer = res.body.find((g: { id: string }) => g.id === 'seismometer')
    expect(seismometer).toMatchObject({ label: 'Sismomètre', status: 'draft', terms: { fr: ['sismomètre'] } })
    expect(typeof seismometer.definition).toBe('string')
    expect(seismometer.sources.length).toBeGreaterThan(0)
  })

  it('GET /api/timeline lists dated machines of both worlds, oldest first (US-5.8)', async () => {
    const res = await request(app).get('/api/timeline')
    expect(res.status).toBe(200)
    const dates = res.body.map((e: { date: { value: string } }) => e.date.value)
    expect(dates).toEqual([...dates].sort())
    expect(new Set(res.body.map((e: { destinationId: string }) => e.destinationId))).toEqual(new Set(['moon', 'mars']))
    expect(res.body[0]).toMatchObject({ machineId: 'surveyor-3-lander', missionName: 'Surveyor 3' })
    for (const entry of res.body) expect(entry.date.sourceIds.length).toBeGreaterThan(0)
  })

  it('GET /api/machines/:id gives the machine lifespan, localized, with its sources (US-5.12)', async () => {
    const res = await request(app).get('/api/machines/opportunity?lang=fr')
    expect(res.status).toBe(200)
    const life = res.body.lifespan
    expect(life.planned.value).toEqual({ amount: 90, unit: 'sols' })
    expect(life.lastContact.value).toBe('2018-06-10')
    expect(life.missionEnd.value).toBe('2019-02-13')
    expect(life.achievements[0].value).toMatch(/kilomètres/)
    const sourceIds = res.body.sources.map((s: { id: string }) => s.id)
    expect(sourceIds).toContain('jpl-opportunity-end-2019')
  })

  it('GET /api/machines/:id names relation ends and resolves the sources they cite', async () => {
    const res = await request(app).get('/api/machines/surveyor-3-lander')
    const sourceIds = new Set(res.body.sources.map((s: { id: string }) => s.id))
    expect(res.body.relations.length).toBeGreaterThan(0)
    for (const relation of res.body.relations as { sourceIds: string[]; fromEntity: unknown; toEntity: unknown }[]) {
      expect(relation.fromEntity).not.toBeNull()
      expect(relation.toEntity).not.toBeNull()
      for (const id of relation.sourceIds) expect(sourceIds.has(id)).toBe(true)
    }
  })
})
