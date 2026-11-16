import { useEffect, useRef, useState } from 'react'
import { Box } from 'lucide-react'
import type { MachinePart, Media } from '@/api/types'
import { LoadState } from '@/components/common/LoadState'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'ready' | 'error'

type ModelViewerConfig = { dracoDecoderLocation?: string; ktx2TranscoderLocation?: string }

/**
 * <model-viewer> downloads its mesh decoders from a Google CDN by default. NASA models are
 * Draco-compressed, so the decoder is served by this site instead (public/draco/, ADR-020).
 * Must run before the library is imported. KTX2 points to a local path too, so that no
 * request ever leaves for a third party (no current model uses KTX2).
 */
function configureModelViewer() {
  const scope = self as unknown as { ModelViewerElement?: ModelViewerConfig }
  scope.ModelViewerElement = {
    ...scope.ModelViewerElement,
    dracoDecoderLocation: `${import.meta.env.BASE_URL}draco/`,
    ktx2TranscoderLocation: `${import.meta.env.BASE_URL}basis/`,
  }
}

/**
 * A NASA 3D model (.glb from NASA 3D Resources) the visitor can turn, zoom and inspect,
 * rendered by <model-viewer> (ADR-020). The library (with three.js) is only downloaded when
 * this component mounts, i.e. after the visitor asked for the 3D view; the .glb file is read
 * from NASA servers (ADR-017). No auto-rotation under reduced motion.
 */
type ModelElement = HTMLElement & {
  positionAndNormalFromPoint?: (x: number, y: number) => { position: { x: number; y: number; z: number } } | null
}

/** Parts of the machine that can be touched on the model (US-5.13): only those with a 3D position. */
type PlacedPart = MachinePart & { modelPosition: { x: number; y: number; z: number } }

export function ModelViewer3D({ model, parts = [] }: { model: Media; parts?: readonly MachinePart[] }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<Status>('loading')
  const [open, setOpen] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const placed = parts.filter((part): part is PlacedPart => Boolean(part.modelPosition))
  const active = placed.find((part) => part.id === open)
  const [attempt, setAttempt] = useState(0)
  const viewerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let alive = true
    configureModelViewer()
    import('@google/model-viewer').then(
      () => alive && setStatus('ready'),
      () => alive && setStatus('error'),
    )
    return () => {
      alive = false
    }
  }, [attempt])

  // The custom element reports a model that cannot be fetched or parsed with an "error" event.
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    const onError = () => setStatus('error')
    const onLoad = () => setLoaded(true)
    viewer.addEventListener('error', onError)
    viewer.addEventListener('load', onLoad)
    return () => {
      viewer.removeEventListener('error', onError)
      viewer.removeEventListener('load', onLoad)
    }
  }, [status])

  // US-5.13: touching the model itself opens the nearest named part.
  const placedRef = useRef(placed)
  useEffect(() => {
    placedRef.current = placed
  })
  useEffect(() => {
    const viewer = viewerRef.current as ModelElement | null
    if (!viewer || status !== 'ready') return
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest?.('[slot^="hotspot"]')) return
      const hit = viewer.positionAndNormalFromPoint?.(event.clientX, event.clientY)
      const list = placedRef.current
      if (!hit || list.length === 0) return
      const distance = (part: PlacedPart) =>
        Math.hypot(part.modelPosition.x - hit.position.x, part.modelPosition.y - hit.position.y, part.modelPosition.z - hit.position.z)
      const nearest = list.reduce((best, part) => (distance(part) < distance(best) ? part : best))
      setOpen(nearest.id)
    }
    viewer.addEventListener('click', onClick)
    return () => viewer.removeEventListener('click', onClick)
  }, [status])

  const retry = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  return (
    <figure className="flex size-full flex-col">
      <div className="relative min-h-72 flex-1 overflow-hidden rounded-2xl border border-stellar-border/70 bg-[radial-gradient(circle_at_50%_40%,rgba(54,214,231,0.12),transparent_65%)]">
        {status === 'ready' ? (
          <model-viewer
            ref={viewerRef}
            src={model.url}
            alt={model.alt}
            camera-controls
            // The wheel must keep scrolling the journey: zooming would capture it (preventDefault).
            disable-zoom
            auto-rotate={(!reduced && !open) || undefined}
            rotation-per-second="18deg"
            touch-action="pan-y"
            interaction-prompt="auto"
            shadow-intensity="1"
            loading="eager"
            style={{ width: '100%', height: '100%', minHeight: '18rem', background: 'transparent' }}
          >
            {placed.map((part) => (
              <button
                key={part.id}
                type="button"
                slot={`hotspot-${part.id}`}
                data-position={`${part.modelPosition.x}m ${part.modelPosition.y}m ${part.modelPosition.z}m`}
                data-visibility-attribute="visible"
                aria-expanded={open === part.id}
                onClick={() => setOpen((current) => (current === part.id ? null : part.id))}
                className={cn('part-marker model-hotspot', open === part.id && 'is-open')}
              >
                <span className={cn('model-hotspot-label', open === part.id && 'is-open')}>{part.name}</span>
              </button>
            ))}
          </model-viewer>
        ) : status === 'loading' ? (
          <div className="flex size-full min-h-72 items-center justify-center">
            <LoadState status="loading" onRetry={retry} />
          </div>
        ) : (
          <div className="flex size-full min-h-72 flex-col items-center justify-center gap-3 p-4 text-center text-sm text-moon-dust">
            <Box aria-hidden="true" className="size-8" />
            <p>{t('journey.modelUnavailable')}</p>
            <button type="button" onClick={retry} className="min-h-11 rounded-md border border-moon-dust/50 px-4 font-medium hover:bg-nebula-surface">
              {t('loading.retry')}
            </button>
          </div>
        )}
        {status === 'ready' && !loaded && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.3em] text-world uppercase">
              <span className="signal-acquire">
                <i />
                <i />
                <i />
                <i />
              </span>
              {t('loading.acquiring')}
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute top-2 left-2">
          <DepictionBadge depiction={model.depiction} />
        </div>
        {/* Large screens (US-5.13): the touched part's card opens on the model view. */}
        {active && (
          <div key={`on-model-${active.id}`} aria-hidden="true" className="part-card-on-photo reading-panel pointer-events-none absolute right-3 bottom-3 hidden w-72 rounded-2xl p-4 lg:block">
            <p className="font-heading text-lg font-bold text-world">{active.name}</p>
            <p className="mt-1 text-sm leading-relaxed">{active.description}</p>
          </div>
        )}
      </div>
      {placed.length > 0 && (
        <div aria-live="polite" className="mt-3 min-h-[5.5rem] lg:min-h-0">
          {active ? (
            <div key={active.id} className="part-card reading-panel rounded-2xl p-4 lg:sr-only">
              <p className="font-heading text-lg font-bold text-world">{active.name}</p>
              <p className="mt-1 leading-relaxed">{active.description}</p>
            </div>
          ) : (
            <p className="text-legible text-sm text-starlight/85">{t('parts.hintModel')}</p>
          )}
        </div>
      )}
      <figcaption className="mt-2 space-y-1 text-xs text-moon-dust">
        {model.description && <p className="text-sm text-starlight/90">{model.description}</p>}
        <p>{t('journey.modelHelp')}</p>
      </figcaption>
    </figure>
  )
}
