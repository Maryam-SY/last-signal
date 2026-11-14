import type {
  DestinationDetail,
  Machine,
  MachineDetailData,
  Media,
  MissionDetail,
  NamedRelation,
  Source,
  StoryDetail,
} from '@/types/content'

/**
 * Fictional API payloads for component tests (ids prefixed "test-"). They follow the real
 * contract types but carry no scientific content, so tests never depend on content progress.
 */
export const testSource: Source = {
  id: 'test-source',
  organization: 'Test Archive',
  title: 'Test reference page',
  url: 'https://example.org/test',
  type: 'other',
  publishedOn: null,
  accessedOn: '2026-11-14',
}

export const testRover: Machine = {
  id: 'test-rover',
  name: 'Test Rover',
  missionId: 'test-mission',
  type: 'rover',
  nssdcaId: '2003-027A',
  date: { value: '2004-01-04', sourceIds: ['test-source'] },
  dateLabel: 'landing',
  locationName: { value: 'Test Crater', sourceIds: ['test-source'] },
  coordinates: { value: { lat: -14.5, lon: 175.47 }, sourceIds: ['test-source'], note: 'Test convention note.' },
  status: { value: 'mission-ended', sourceIds: ['test-source'] },
  scienceSummary: { value: 'A fictional science summary.', sourceIds: ['test-source'] },
  storyIds: [],
}

export const testLander: Machine = {
  id: 'test-lander',
  name: 'Test Lander',
  missionId: 'test-mission',
  type: 'lander',
  nssdcaId: null,
  date: null,
  locationName: null,
  coordinates: null,
  status: { value: 'unknown', sourceIds: ['test-source'] },
  scienceSummary: null,
  storyIds: [],
}

const media = (id: string, overrides: Partial<Media> = {}): Media => ({
  id,
  type: 'image',
  url: `https://example.org/${id}.jpg`,
  pageUrl: `https://example.org/${id}`,
  title: null,
  caption: null,
  alt: `Alt text of ${id}`,
  credit: 'Test Credit',
  license: 'Test licence',
  missionIds: ['test-mission'],
  machineIds: ['test-rover'],
  sourceId: 'test-source',
  aiGenerated: false,
  depiction: 'photo',
  ...overrides,
})

export const roverPhoto = media('test-rover-photo')
export const roverArtwork = media('test-rover-artwork', { depiction: 'artwork' })
export const roverVideo = media('test-rover-video', { type: 'video', depiction: 'mixed', thumbnailUrl: null, title: 'Test video' })

const relation: NamedRelation = {
  id: 'test-relation',
  from: { kind: 'machine', id: 'test-lander' },
  to: { kind: 'machine', id: 'test-rover' },
  type: 'technology',
  transmitted: 'A fictional technology.',
  evidence: 'A fictional report.',
  sourceIds: ['test-source'],
  showOnMap: false,
  fromEntity: { kind: 'machine', id: 'test-lander', name: 'Test Lander', destinationId: 'mars' },
  toEntity: { kind: 'machine', id: 'test-rover', name: 'Test Rover', destinationId: 'mars' },
}

const missionBase = {
  id: 'test-mission',
  name: 'Test Mission',
  destinationId: 'mars' as const,
  agency: ['TEST'],
  nssdcaIds: [],
  period: { value: { start: '2004-01-04', end: '2010-03-22' }, sourceIds: ['test-source'] },
  summary: 'A fictional mission used by tests.',
  mainStoryId: 'test-story',
  sourceIds: ['test-source'],
  order: 1,
  timeline: [
    {
      id: 'test-landing',
      date: { value: '2004-01-04', sourceIds: ['test-source'] },
      title: 'Test landing',
      description: 'The fictional rover lands.',
      mediaIds: ['test-rover-artwork'],
    },
  ],
}

export const destinationFixture: DestinationDetail = {
  id: 'mars',
  name: 'Mars',
  kind: 'planet',
  intro: 'A fictional introduction to Mars.',
  order: 2,
  missionCount: 1,
  machineCount: 2,
  missions: [
    {
      ...missionBase,
      machines: [testRover, testLander],
      mainStory: { id: 'test-story', title: 'The Test Story', status: 'draft', missionIds: ['test-mission'] },
    },
  ],
}

export const missionFixture: MissionDetail = {
  ...missionBase,
  timeline: missionBase.timeline.map((event) => ({ ...event, media: [roverArtwork] })),
  machines: [testRover, testLander],
  stories: [],
  relations: [relation],
  media: [roverPhoto, roverArtwork],
}

export const machineFixture: MachineDetailData = {
  ...testRover,
  destinationId: 'mars',
  mission: { id: 'test-mission', name: 'Test Mission', destinationId: 'mars' },
  relations: [relation],
  media: [roverArtwork, roverPhoto, roverVideo],
  storyTarget: { id: 'test-story', title: 'The Test Story', status: 'draft', missionIds: ['test-mission'] },
  sources: [testSource],
}

const step = (key: StoryDetail['steps'][number]['key'], title: string, text: string) => ({
  key,
  title,
  blocks: [{ voice: 'data' as const, text, sourceIds: ['test-source'] }],
})

export const storyFixture: StoryDetail = {
  id: 'test-story',
  kind: 'mission',
  missionIds: ['test-mission'],
  machineIds: ['test-rover', 'test-lander'],
  title: 'The Test Story',
  status: 'draft',
  steps: [
    {
      key: 'signal',
      title: 'Signal',
      blocks: [{ voice: 'data', text: 'Signal fact.', sourceIds: ['test-source'], mediaIds: ['test-rover-artwork'] }],
    },
    {
      key: 'why',
      title: 'Why',
      blocks: [{ voice: 'interpretation', text: 'Why it matters.', sourceIds: ['test-source'] }],
    },
    step('how', 'How', 'How fact.'),
    step('discovery', 'Discovery', 'Discovery fact.'),
    { ...step('relay', 'Relay', 'Relay fact.'), relationIds: ['test-relation'] },
    {
      key: 'your-turn',
      title: 'Your turn',
      blocks: [{ voice: 'imagination', text: 'What would you build?', sourceIds: [] }],
    },
  ],
  missions: [{ kind: 'mission', id: 'test-mission', name: 'Test Mission', destinationId: 'mars' }],
  machines: [
    { kind: 'machine', id: 'test-rover', name: 'Test Rover', destinationId: 'mars' },
    { kind: 'machine', id: 'test-lander', name: 'Test Lander', destinationId: 'mars' },
  ],
  relations: [relation],
  media: [roverArtwork],
  sources: [testSource],
}
