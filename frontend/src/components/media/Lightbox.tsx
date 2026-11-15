import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { Media } from '@/api/types'
import { useTranslation } from '@/i18n'
import { zoomSrc } from '@/lib/mediaSrc'
import { cn } from '@/lib/utils'
import { DepictionBadge } from './DepictionBadge'

interface LightboxProps {
  media: Media | null
  onClose: () => void
}

/**
 * Look at a picture up close (US-5.15): the original file, as large as the screen allows, with
 * what it shows and its "not a photo" label when it applies. A native <dialog>: Escape closes
 * it, focus comes back to the button that opened it, the page behind is inert.
 */
export function Lightbox({ media, onClose }: LightboxProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (media && !dialog.open) {
      try {
        dialog.showModal()
      } catch {
        dialog.setAttribute('open', '')
      }
    } else if (!media && dialog.open) dialog.close()
  }, [media])

  if (!media) return null
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={media.title ?? media.alt}
      className="lightbox h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-starlight backdrop:bg-void/90"
    >
      <div className="relative flex h-full w-full items-center justify-center">
        {/* The whole backdrop closes the picture; the visible button does the same for the keyboard. */}
        <button type="button" tabIndex={-1} aria-hidden="true" onClick={onClose} className="absolute inset-0 cursor-zoom-out bg-transparent" />
        <div className="relative flex max-h-full w-[min(100vw,96rem)] flex-col">
          <img src={zoomSrc(media)} alt={media.alt} decoding="async" className="mx-auto max-h-[78dvh] w-auto max-w-full object-contain" />
          <div className="mx-auto flex w-full max-w-4xl flex-wrap items-start gap-3 px-5 py-4">
            <DepictionBadge depiction={media.depiction} />
            <p className={cn('min-w-0 flex-1 text-sm leading-relaxed sm:text-base')}>{media.description ?? media.alt}</p>
            <button
              type="button"
              onClick={onClose}
              className="glass-blur inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:border-world hover:text-world"
            >
              <X aria-hidden="true" className="size-4" />
              {t('lightbox.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
