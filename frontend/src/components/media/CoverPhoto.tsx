import { useState } from 'react'
import type { Media } from '@/api/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface CoverPhotoProps {
  media: Media
  className?: string
  imageClassName?: string
}

/**
 * A real photograph used as the face of a machine or a story (US-5.7). The API only picks
 * `depiction: "photo"` images as covers, so no "not a photo" badge is ever needed here; the
 * credit stays visible. If the remote file cannot load, the cover simply disappears.
 */
export function CoverPhoto({ media, className, imageClassName }: CoverPhotoProps) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  if (failed || media.depiction !== 'photo') return null

  return (
    <figure className={cn('relative overflow-hidden', className)}>
      <img
        src={media.thumbnailUrl ?? media.url}
        alt={media.alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn('size-full object-cover', imageClassName)}
      />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
      {media.credit && (
        <figcaption className="absolute right-2 bottom-1.5 left-3 truncate text-right font-mono text-[0.6rem] text-starlight/80">
          {t('pedagogy.coverCredit', { credit: media.credit })}
        </figcaption>
      )}
    </figure>
  )
}
