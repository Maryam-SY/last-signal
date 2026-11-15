import { useState } from 'react'
import type { Media } from '@/api/types'
import { cardSrc } from '@/lib/mediaSrc'
import { cn } from '@/lib/utils'
import { DepictionBadge } from './DepictionBadge'

interface CoverPhotoProps {
  media: Media
  className?: string
  imageClassName?: string
}

/**
 * A real photograph used as the face of a machine or a story (US-5.7). The API only picks
 * `depiction: "photo"` images as covers; anything else gets its label (MEDIA-001). Credits
 * are listed on the About page (US-5.11). If the remote file cannot load, the cover disappears.
 */
export function CoverPhoto({ media, className, imageClassName }: CoverPhotoProps) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <figure className={cn('relative overflow-hidden', className)}>
      <img
        src={cardSrc(media)}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn('size-full object-cover', imageClassName)}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
      {/* Covers are photos; should a scene fall back to a drawing, it says so (MEDIA-001). */}
      <span className="absolute top-2 left-2">
        <DepictionBadge depiction={media.depiction} />
      </span>
    </figure>
  )
}
