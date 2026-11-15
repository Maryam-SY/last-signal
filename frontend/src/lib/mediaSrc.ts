import type { Media } from '@/api/types'

/**
 * Picks the right copy of a picture for where it is shown (US-5.14, performance audit): NASA
 * originals reach 5 000 px and several MB, while the page draws them in a 300–1 900 px box.
 * The content carries a `largeUrl` only when that copy was verified to exist (the NASA library
 * does not publish every size of every picture), so nothing here guesses a URL.
 */

/** Source for a picture drawn in a card or a list (small box). */
export function cardSrc(media: Pick<Media, 'url' | 'thumbnailUrl' | 'largeUrl'>): string {
  return media.thumbnailUrl ?? media.largeUrl ?? media.url
}

/** Source for a picture that fills a column or the screen (large box). */
export function sceneSrc(media: Pick<Media, 'url' | 'largeUrl'>): string {
  return media.largeUrl ?? media.url
}
