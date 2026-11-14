import type { Media, Source } from '@/types/content'

/** Lookup tables for the sources and media shipped with (or fetched next to) an API payload. */
export interface ContentIndex {
  sources: ReadonlyMap<string, Source>
  media: ReadonlyMap<string, Media>
}

export function buildContentIndex(payload: { sources?: readonly Source[]; media?: readonly Media[] }): ContentIndex {
  return {
    sources: new Map((payload.sources ?? []).map((source) => [source.id, source])),
    media: new Map((payload.media ?? []).map((item) => [item.id, item])),
  }
}

/** Best picture to represent a machine: a real photo first, then any still image. */
export function pickCover(media: readonly Media[]): Media | undefined {
  const images = media.filter((item) => item.type === 'image' || item.type === 'animation')
  return images.find((item) => item.depiction === 'photo') ?? images[0]
}
