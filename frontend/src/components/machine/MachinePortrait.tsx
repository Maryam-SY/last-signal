import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import type { Media } from '@/api/types'
import { HudCorners } from '@/components/common/HudCorners'
import { ZoomIn } from 'lucide-react'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { Lightbox } from '@/components/media/Lightbox'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { sceneSrc } from '@/lib/mediaSrc'
import { cn } from '@/lib/utils'

/** A named part of the machine, placed on the photo (percent of its width / height). */
export interface PortraitPart {
  id: string
  name: string
  description: string
  x: number
  y: number
}

interface MachinePortraitProps {
  media: Media
  parts?: readonly PortraitPart[]
  className?: string
}

/**
 * The machine's photo as an object you can turn a little (US-5.13): it tilts toward the
 * pointer in 3D, a light sweeps over it and a blurred copy behind gives it depth — a "3D" feel
 * without a 3D model. Its named parts are markers on the photo: touching or focusing one opens
 * its name and what it does. Under reduced motion the photo stays still.
 */
export function MachinePortrait({ media, parts = [], className }: MachinePortraitProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [zoom, setZoom] = useState(false)

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    if (!frame || reduced) return
    const rect = frame.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    frame.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
    frame.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    frame.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    frame.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  const onPointerLeave = () => {
    const frame = frameRef.current
    if (!frame) return
    frame.style.setProperty('--ry', '0deg')
    frame.style.setProperty('--rx', '0deg')
  }

  const active = parts.find((part) => part.id === open)

  return (
    <figure className={cn('machine-portrait relative', className)}>
      <div className="machine-portrait-stage relative" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
        <div ref={frameRef} className="machine-portrait-frame relative overflow-hidden rounded-3xl" style={{ '--rx': '0deg', '--ry': '0deg' } as CSSProperties}>
          {/* Depth: a blurred, larger copy behind the photo. */}
          <img src={media.thumbnailUrl ?? media.url} alt="" aria-hidden="true" className="machine-portrait-back absolute inset-0 size-full object-cover" />
          <img src={sceneSrc(media)} alt={media.alt} decoding="async" className="relative block w-full object-cover" />
          <span aria-hidden="true" className="machine-portrait-glare pointer-events-none absolute inset-0" />
          <HudCorners />
          <span className="absolute top-3 left-3">
            <DepictionBadge depiction={media.depiction} />
          </span>
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label={t('lightbox.open')}
            className="glass-blur absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full text-starlight transition-colors hover:border-world hover:text-world"
          >
            <ZoomIn aria-hidden="true" className="size-5" />
          </button>

          {parts.length > 0 && (
            <ul aria-label={t('parts.label')} className="absolute inset-0">
              {parts.map((part, index) => (
                <li key={part.id} className="absolute" style={{ left: `${part.x}%`, top: `${part.y}%` }}>
                  <button
                    type="button"
                    aria-expanded={open === part.id}
                    aria-controls={`part-${part.id}`}
                    onClick={() => setOpen((current) => (current === part.id ? null : part.id))}
                    className={cn('part-marker', open === part.id && 'is-open')}
                    style={{ '--i': index } as CSSProperties}
                  >
                    <span className="sr-only">{part.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Large screens (US-5.13): the part's card opens on the photo, next to its dot. */}
        {active && (
          <div
            key={`on-photo-${active.id}`}
            aria-hidden="true"
            className="part-card-on-photo reading-panel pointer-events-none absolute z-10 hidden w-64 rounded-2xl p-4 lg:block"
            style={{
              left: `${active.x}%`,
              top: `${active.y}%`,
              transform: `translate(${active.x > 55 ? 'calc(-100% - 22px)' : '22px'}, ${active.y > 60 ? 'calc(-100% + 12px)' : '-12px'})`,
            }}
          >
            <p className="font-heading text-lg font-bold text-world">{active.name}</p>
            <p className="mt-1 text-sm leading-relaxed">{active.description}</p>
          </div>
        )}
      </div>

      {parts.length > 0 && (
        <div aria-live="polite" className="mt-3 min-h-[5.5rem] lg:min-h-0">
          {active ? (
            <div id={`part-${active.id}`} key={active.id} className="part-card reading-panel rounded-2xl p-4 lg:sr-only">
              <p className="font-heading text-lg font-bold text-world">{active.name}</p>
              <p className="mt-1 leading-relaxed">{active.description}</p>
            </div>
          ) : (
            <p className="text-legible text-sm text-starlight/85">{t('parts.hint')}</p>
          )}
        </div>
      )}
      <Lightbox media={zoom ? media : null} onClose={() => setZoom(false)} />
    </figure>
  )
}
