import type { Media } from '@/api/types'

/**
 * Picks the right copy of a picture for where it is shown (US-5.14, performance audit): NASA
 * originals reach 5 000 px and several MB, while the page draws them in a 300–1 900 px box.
 * The content carries a `largeUrl` only when that copy was verified to exist (the NASA library
 * does not publish every size of every picture), so nothing here guesses a URL.
 *
 * ADR-027: on the deployed site, pictures go through Vercel's image optimisation — resized to
 * the box they fill and re-encoded in WebP (several times lighter), cached 31 days. The content
 * still points at NASA (ADR-017). Locally (no optimiser) the NASA files are used as they are;
 * and if an optimised copy ever fails (monthly quota, NASA down), `installImageFallback` swaps
 * the original back in.
 */

/** Widths allowed in vercel.json (`images.sizes`): any other width is refused by Vercel. */
export const IMAGE_WIDTHS = [256, 640, 1080, 1600, 2048] as const
export type ImageWidth = (typeof IMAGE_WIDTHS)[number]
/** One quality (vercel.json `images.qualities`): one cached copy per width. */
const QUALITY = 70
const OPTIMIZER = '/_vercel/image?'

/** NASA hosts allowed in vercel.json (`images.remotePatterns`). */
const OPTIMIZED_HOSTS = new Set([
  'images-assets.nasa.gov',
  'assets.science.nasa.gov',
  'nssdc.gsfc.nasa.gov',
  'science.nasa.gov',
  'www.nasa.gov',
  'apollojournals.org',
  'www.apollojournals.org',
  'd2pn8kiwq2w21t.cloudfront.net',
  'ilrs.gsfc.nasa.gov',
])

/** The optimiser exists only on the deployed site (not in `vite dev` or `vite preview` on this machine). */
export function optimizerEnabled(): boolean {
  if (!import.meta.env.PROD || typeof window === 'undefined') return false
  const host = window.location.hostname
  return host !== 'localhost' && host !== '127.0.0.1' && host !== '[::1]'
}

/** URL of the optimised copy of `url` at `width`, or `url` itself when it cannot be optimised. */
export function optimized(url: string, width: ImageWidth, enabled = optimizerEnabled()): string {
  if (!enabled) return url
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }
  // GIF and SVG are served as they are by Vercel: no point spending a transformation on them.
  if (parsed.protocol !== 'https:' || !OPTIMIZED_HOSTS.has(parsed.hostname) || /\.(gif|svg)$/i.test(parsed.pathname)) return url
  return `${OPTIMIZER}url=${encodeURIComponent(url)}&w=${width}&q=${QUALITY}`
}

/** The NASA URL behind an optimised copy (null when `src` is not one). */
export function originalOf(src: string): string | null {
  const at = src.indexOf(OPTIMIZER)
  return at < 0 ? null : new URLSearchParams(src.slice(at + OPTIMIZER.length)).get('url')
}

/** Width for a picture that fills the screen: phones get 1080 px, larger screens 1600 px. */
function screenWidth(): ImageWidth {
  if (typeof window === 'undefined') return 1600
  return window.innerWidth * (window.devicePixelRatio || 1) <= 1180 ? 1080 : 1600
}

/** Source for a picture drawn in a card or a list (small box). */
export function cardSrc(media: Pick<Media, 'url' | 'thumbnailUrl' | 'largeUrl'>, enabled = optimizerEnabled()): string {
  // With the optimiser, a sharp 640 px copy of the large picture beats NASA's small thumbnail.
  if (enabled) {
    const source = media.largeUrl ?? media.url
    const card = optimized(source, 640, true)
    if (card !== source) return card
  }
  return media.thumbnailUrl ?? media.largeUrl ?? media.url
}

/**
 * Source for the dimmed copy that fills the frame around a whole picture (seen at about a
 * third of its brightness, often blurred): 256 px is plenty.
 */
export function ambientSrc(media: Pick<Media, 'url' | 'thumbnailUrl' | 'largeUrl'>, enabled = optimizerEnabled()): string {
  if (enabled) {
    const source = media.largeUrl ?? media.url
    const ambient = optimized(source, 256, true)
    if (ambient !== source) return ambient
  }
  return media.thumbnailUrl ?? media.largeUrl ?? media.url
}

/** Source for a picture that fills a column or the screen (large box). */
export function sceneSrc(media: Pick<Media, 'url' | 'largeUrl'>, enabled = optimizerEnabled()): string {
  return optimized(media.largeUrl ?? media.url, screenWidth(), enabled)
}

/** Source for a picture opened full screen (zoom): the best copy, at most 2048 px. */
export function zoomSrc(media: Pick<Media, 'url' | 'largeUrl'>, enabled = optimizerEnabled()): string {
  return optimized(media.url, 2048, enabled)
}

/**
 * One safety net for every <img> of the site: when an optimised copy fails to load, the
 * original NASA picture takes its place (React leaves the swapped `src` alone).
 */
export function installImageFallback(): void {
  if (typeof window === 'undefined') return
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target
      if (!(target instanceof HTMLImageElement)) return
      const original = originalOf(target.currentSrc || target.src)
      if (original) target.src = original
    },
    true,
  )
}
