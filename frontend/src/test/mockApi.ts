import { vi } from 'vitest'
import { destinationFixture, machineFixture, missionFixture, roverArtwork, roverPhoto, storyFixture, testSource } from './fixtures/api'

type Routes = Record<string, unknown>

/** Routes are matched on the path without `lang`; other query parameters are kept (e.g. /media?missionId=…). */
const DEFAULT_ROUTES: Routes = {
  '/api/destinations/mars': destinationFixture,
  '/api/destinations/moon': { ...destinationFixture, id: 'moon', name: 'Moon', missions: [] },
  '/api/missions/test-mission': missionFixture,
  '/api/machines/test-rover': machineFixture,
  '/api/stories/test-story': storyFixture,
  '/api/sources': [testSource],
  '/api/media?missionId=test-mission': [roverArtwork, roverPhoto],
}

function routeKey(input: RequestInfo | URL): string {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(raw, 'http://localhost')
  url.searchParams.delete('lang')
  const search = url.searchParams.toString()
  return search ? `${url.pathname}?${search}` : url.pathname
}

/**
 * Replaces `fetch` with an in-memory API answering the fixture routes (404 otherwise).
 * Pass `failing` paths to simulate a network error. Undo with `vi.unstubAllGlobals()`.
 */
export function mockApi(overrides: Routes = {}, failing: string[] = []) {
  const routes = { ...DEFAULT_ROUTES, ...overrides }
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const key = routeKey(input)
    if (failing.includes(key)) throw new TypeError('Failed to fetch')
    const body = routes[key]
    return new Response(JSON.stringify(body ?? { error: 'Not found' }), {
      status: body === undefined ? 404 : 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
