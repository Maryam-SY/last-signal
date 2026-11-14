import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Content, Story } from './types.js'

/** backend/content, resolved from both src/ (tsx, vitest) and dist/ (compiled). */
export const DEFAULT_CONTENT_DIR = fileURLToPath(new URL('../../content', import.meta.url))

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T
}

/**
 * Reads every content file. Types are asserted here and enforced by `validateContent`
 * (run at startup and in the test suite), not by the JSON parser.
 */
export function loadContent(dir: string = process.env.CONTENT_DIR ?? DEFAULT_CONTENT_DIR): Content {
  const storiesDir = join(dir, 'stories')
  const stories = readdirSync(storiesDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => readJson<Story>(join(storiesDir, name)))

  return {
    destinations: readJson(join(dir, 'destinations.json')),
    missions: readJson(join(dir, 'missions.json')),
    machines: readJson(join(dir, 'machines.json')),
    relations: readJson(join(dir, 'relations.json')),
    sources: readJson(join(dir, 'sources.json')),
    media: readJson(join(dir, 'media.json')),
    glossary: readJson(join(dir, 'glossary.json')),
    stories,
  }
}
