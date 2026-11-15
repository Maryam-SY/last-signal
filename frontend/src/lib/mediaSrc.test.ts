import { describe, expect, it } from 'vitest'
import { cardSrc, sceneSrc } from './mediaSrc'

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
