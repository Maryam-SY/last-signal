import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONTENT_SECURITY_POLICY, NASA_IMAGE_HOSTS, NASA_MODEL_HOSTS, NASA_VIDEO_HOSTS, SECURITY_HEADERS } from './headers'

const ROOT = join(import.meta.dirname, '../../..')

interface VercelConfig {
  headers: { source: string; headers: { key: string; value: string }[] }[]
  images: { remotePatterns: { hostname: string }[] }
}
const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')) as VercelConfig

/** Every media object of backend/content/ (the ones carrying a `depiction`). */
function contentMedia(): { id?: string; type?: string; url?: string; largeUrl?: string; thumbnailUrl?: string }[] {
  const found: ReturnType<typeof contentMedia> = []
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') {
      if ('depiction' in value) found.push(value as ReturnType<typeof contentMedia>[number])
      Object.values(value).forEach(walk)
    }
  }
  const visit = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) visit(path)
      else if (name.endsWith('.json')) walk(JSON.parse(readFileSync(path, 'utf8')))
    }
  }
  visit(join(ROOT, 'backend/content'))
  return found
}

const hostOf = (url: string) => new URL(url).hostname

describe('security headers', () => {
  it('forbids inline and external scripts, framing and plugins', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self' 'wasm-unsafe-eval';")
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/'unsafe-eval'|script-src[^;]*https?:/)
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'")
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'")
    expect(CONTENT_SECURITY_POLICY).toContain("frame-src 'none'")
  })

  it('only allows NASA hosts as external origins', () => {
    const external = CONTENT_SECURITY_POLICY.match(/https:\/\/[^\s;]+/g) ?? []
    const allowed = new Set([...NASA_IMAGE_HOSTS, ...NASA_VIDEO_HOSTS, ...NASA_MODEL_HOSTS].map((host) => `https://${host}`))
    expect(external.length).toBeGreaterThan(0)
    for (const origin of external) expect(allowed).toContain(origin)
  })

  it('vercel.json serves exactly the same headers on every path', () => {
    const all = vercel.headers.find((rule) => rule.source === '/(.*)')
    const served = Object.fromEntries((all?.headers ?? []).map(({ key, value }) => [key, value]))
    expect(served).toEqual(SECURITY_HEADERS)
  })

  it('lets Vercel optimise exactly the pictures the CSP allows', () => {
    expect(new Set(vercel.images.remotePatterns.map((pattern) => pattern.hostname))).toEqual(new Set(NASA_IMAGE_HOSTS))
  })

  it('allows every media the content loads in the page', () => {
    const blocked: string[] = []
    for (const media of contentMedia()) {
      const pictures = [media.thumbnailUrl, media.largeUrl, media.type === 'image' || media.type === 'animation' ? media.url : null]
      for (const url of pictures) if (url && !(NASA_IMAGE_HOSTS as readonly string[]).includes(hostOf(url))) blocked.push(`${media.id}: ${url}`)
      if (media.type === 'video' && media.url && !/youtube\.com|youtu\.be/.test(media.url) && !(NASA_VIDEO_HOSTS as readonly string[]).includes(hostOf(media.url))) blocked.push(`${media.id}: ${media.url}`)
    }
    expect(blocked).toEqual([])
  })
})
