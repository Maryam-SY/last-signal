import { Box, ExternalLink, FileText, Film, ImageOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Media } from '@/types/content'
import { DepictionBadge } from './DepictionBadge'

interface MediaFigureProps {
  media: Media
  className?: string
  imageClassName?: string
  /** Above-the-fold images load eagerly; everything else lazily. */
  priority?: boolean
  /** Show the plain-language description under the media when there is one. */
  withDescription?: boolean
}

const LINK_ICONS = { video: Film, '3d-model': Box, document: FileText } as const
type LinkType = keyof typeof LINK_ICONS

function isLinkType(type: Media['type']): type is LinkType {
  return type in LINK_ICONS
}

/**
 * A media referenced by URL (ADR-017): still images are shown, videos, 3D models and documents
 * are offered as links. The depiction badge and the credit are always visible (ABOUT-001). A
 * remote image that fails to load is replaced by a placeholder; the source link stays.
 */
export function MediaFigure({ media, className, imageClassName, priority = false, withDescription = false }: MediaFigureProps) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const isStill = media.type === 'image' || media.type === 'animation'
  const preview = isStill ? media.url : media.thumbnailUrl

  return (
    <figure className={cn('overflow-hidden', className)}>
      <div className="relative">
        {preview && !failed ? (
          <img
            src={preview}
            alt={media.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className={cn('block h-auto w-full bg-deep-space object-cover', imageClassName)}
          />
        ) : isStill ? (
          <div className={cn('flex min-h-40 flex-col items-center justify-center gap-2 bg-deep-space p-4 text-center text-xs text-moon-dust', imageClassName)}>
            <ImageOff aria-hidden className="size-6" />
            <span>{t('media.unavailable')}</span>
            <span className="sr-only">{media.alt}</span>
          </div>
        ) : null}
        <DepictionBadge media={media} className="absolute left-2 top-2" />
      </div>
      {isLinkType(media.type) && (
        <MediaLink media={media} type={media.type} />
      )}
      <figcaption className="px-1 pt-1.5 text-xs leading-snug text-moon-dust">
        {withDescription && media.description && <span className="mb-1 block text-sm text-starlight/90">{media.description}</span>}
        <span className="font-mono text-[0.65rem]">
          {media.credit ?? t('media.unknownCredit')} ·{' '}
          <a href={media.pageUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-starlight hover:underline">
            {t('media.sourcePage')}
            {' '}<span className="sr-only">{t('common.opensInNewTab')}</span>
          </a>
        </span>
      </figcaption>
    </figure>
  )
}

function MediaLink({ media, type }: { media: Media; type: LinkType }) {
  const { t } = useTranslation()
  const Icon = LINK_ICONS[type]
  return (
    <a
      href={media.pageUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex min-h-11 items-start gap-2 rounded-md border border-moon-dust/60 px-3 py-2 text-sm hover:border-starlight"
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{t(`media.open.${type}`)}</span>
        {media.title && <span className="block text-xs text-moon-dust">{media.title}</span>}
        <span className="sr-only">{t('common.opensInNewTab')}</span>
      </span>
      <ExternalLink aria-hidden className="mt-0.5 size-3.5 shrink-0" />
    </a>
  )
}
