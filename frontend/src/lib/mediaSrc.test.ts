import { describe, expect, it } from 'vitest'
import { cardSrc, optimized, originalOf, sceneSrc, zoomSrc } from './mediaSrc'

describe('picture sizes (US-5.14)', () => {
  const orig = 'https://images-assets.nasa.gov/image/PIA05755/PIA05755~orig.jpg'
  const large = 'https://images-assets.nasa.gov/image/PIA05755/PIA05755~large.jpg'

  it('uses the verified mid-size copy for scenes, never a guessed one', () => {
    expect(sceneSrc({ url: orig, largeUrl: large })).toBe(large)
    expect(sceneSrc({ url: orig, largeUrl: null })).toBe(orig)
    expect(sceneSrc({ url: orig })).toBe(orig)
  })

  it('prefers the thumbnail for cards, then the mid-size copy, then the original', () => {
    expect(cardSrc({ url: orig, thumbnailUrl: 'https://images-assets.nasa.gov/image/x/x~thumb.jpg', largeUrl: large })).toBe('https://images-assets.nasa.gov/image/x/x~thumb.jpg')
    expect(cardSrc({ url: orig, thumbnailUrl: null, largeUrl: large })).toBe(large)
    expect(cardSrc({ url: orig, thumbnailUrl: null })).toBe(orig)
  })
})

describe('Vercel image optimisation (ADR-027)', () => {
  const orig = 'https://images-assets.nasa.gov/image/PIA05755/PIA05755~orig.jpg'
  const large = 'https://images-assets.nasa.gov/image/PIA05755/PIA05755~large.jpg'

  it('asks Vercel for a resized copy of NASA pictures, keeping the original reachable', () => {
    const src = optimized(large, 1080, true)
    expect(src).toBe(`/_vercel/image?url=${encodeURIComponent(large)}&w=1080&q=70`)
    expect(originalOf(src)).toBe(large)
    expect(originalOf(large)).toBeNull()
  })

  it('leaves GIFs, unknown hosts and the local site (no optimiser) untouched', () => {
    expect(optimized('https://nssdc.gsfc.nasa.gov/imgcat/thumbnail/a12_h_48_7100.gif', 640, true)).toBe('https://nssdc.gsfc.nasa.gov/imgcat/thumbnail/a12_h_48_7100.gif')
    expect(optimized('https://example.com/picture.jpg', 640, true)).toBe('https://example.com/picture.jpg')
    expect(optimized(large, 640, false)).toBe(large)
  })

  it('draws cards from the large picture at 640 px, and zooms from the original at 2048 px', () => {
    expect(cardSrc({ url: orig, thumbnailUrl: 'https://images-assets.nasa.gov/image/x/x~thumb.jpg', largeUrl: large }, true)).toContain(`url=${encodeURIComponent(large)}&w=640`)
    expect(zoomSrc({ url: orig, largeUrl: large }, true)).toContain(`url=${encodeURIComponent(orig)}&w=2048`)
    expect(sceneSrc({ url: orig, largeUrl: large }, true)).toMatch(/&w=(1080|1600)&q=70$/)
  })
})

