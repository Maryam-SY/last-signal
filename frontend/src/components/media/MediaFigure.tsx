import { useState } from 'react'
import { Box, FileText, ImageOff, PlayCircle } from 'lucide-react'
import type { Media } from '@/api/types'
import { useTranslation } from '@/i18n'
import { sameText } from '@/lib/sameText'
import { sceneSrc } from '@/lib/mediaSrc'
import { cn } from '@/lib/utils'
import { DepictionBadge } from './DepictionBadge'

interface MediaFigureProps {
  media: Media
  className?: string
  /** Short lead-in before the description of the picture (e.g. "What you see:"). */
  lead?: string
  /** Tell the story behind the picture (`media.description`) above what it shows. */
  withStory?: boolean
  /**
   * Caption only: the picture itself is drawn elsewhere (the 3D photo flight), so it stays here
   * for screen readers only; the depiction label moves into the caption (MEDIA-001).
   */
  captionOnly?: boolean
}

/**
 * Displays one media reference (image, animation, video, 3D model or document) with its
 * depiction label (MEDIA-001). Credits and links to the original pages are listed once, on the
 * About page (US-5.11). Files are never copied: they are loaded from NASA servers (ADR-017).
 */
export function MediaFigure({ media, className, lead, withStory = false, captionOnly = false }: MediaFigureProps) {
  // Never the same text twice (US-5.13): when the picture's story already says what it shows,
  // the "What you see:" line is left out.
  const story = withStory ? media.description : undefined
  const showWhat = !sameText(story, media.alt)
  if (captionOnly) {
    return (
      <figure className={className}>
        {/* The picture itself is drawn elsewhere (flight, backdrop); screen readers get its
            description here without a second download of the file (US-5.14 audit). */}
        <span className="sr-only">{media.alt}</span>
        <figcaption className="space-y-1.5 text-sm">
          <DepictionBadge depiction={media.depiction} />
          {story && <p className="leading-relaxed text-starlight/90">{story}</p>}
          {showWhat && (
            <p className="text-xs text-moon-dust">
              {lead && <span className="font-semibold text-world">{lead} </span>}
              {media.alt}
            </p>
          )}
        </figcaption>
      </figure>
    )
  }

  return (
    <figure className={cn('overflow-hidden rounded-lg border border-stellar-border/60 bg-deep-space', className)}>
      <div className="relative">
        <MediaBody media={media} />
        <div className="pointer-events-none absolute top-2 left-2">
          <DepictionBadge depiction={media.depiction} />
        </div>
      </div>
      <figcaption className="space-y-1 p-3 text-sm">
        {story && <p className="text-base leading-relaxed text-starlight">{story}</p>}
        {showWhat && (
          <p className={cn(story && 'text-xs text-moon-dust')}>
            {lead && <span className="font-semibold text-world">{lead} </span>}
            {media.alt}
          </p>
        )}
      </figcaption>
    </figure>
  )
}

function MediaBody({ media }: { media: Media }) {
  const { t } = useTranslation()
  const isYoutube = /youtube\.com|youtu\.be/.test(media.url)

  if (media.type === 'image' || media.type === 'animation') return <RemoteImage media={media} />

  if (media.type === 'video' && !isYoutube) {
    return (
      <video controls preload="none" poster={media.thumbnailUrl ?? undefined} className="aspect-video w-full bg-void" aria-label={media.alt}>
        <source src={media.url} type="video/mp4" />
        {t('media.videoUnsupported')}
      </video>
    )
  }

  // YouTube videos, 3D models and documents open on their official page (no third-party embed).
  const label = media.type === '3d-model' ? t('media.open3d') : media.type === 'document' ? t('media.openDocument') : t('media.openVideo')
  const Icon = media.type === '3d-model' ? Box : media.type === 'document' ? FileText : PlayCircle
  // A 3D model file (.glb) is not a page: send the visitor to its NASA page instead.
  return (
    <a
      href={media.type === '3d-model' ? media.pageUrl : media.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-nebula-surface text-center text-sm font-medium text-cosmic-indigo hover:underline"
    >
      <Icon aria-hidden="true" className="size-10" />
      {label}
      <span className="sr-only">{t('media.newTab')}</span>
    </a>
  )
}

/**
 * Media are loaded from NASA servers (ADR-017): if one moves or is unreachable, say so instead
 * of showing a broken image.
 */
function RemoteImage({ media }: { media: Media }) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-nebula-surface p-4 text-center text-sm text-moon-dust">
        <ImageOff aria-hidden="true" className="size-8" />
        <p>{t('media.unavailable')}</p>
        <p className="sr-only">{media.alt}</p>
      </div>
    )
  }
  return (
    <img
      src={sceneSrc(media)}
      alt={media.alt}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        // The mid-size copy failed: try the original once before giving up.
        if (event.currentTarget.src !== media.url) event.currentTarget.src = media.url
        else setFailed(true)
      }}
      className="aspect-video w-full object-cover"
    />
  )
}
