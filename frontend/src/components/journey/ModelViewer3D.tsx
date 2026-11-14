import { useEffect, useRef, useState } from 'react'
import { Box } from 'lucide-react'
import type { Media } from '@/api/types'
import { LoadState } from '@/components/common/LoadState'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'

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
export function ModelViewer3D({ model }: { model: Media }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [status, setStatus] = useState<Status>('loading')
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
    viewer.addEventListener('error', onError)
    return () => viewer.removeEventListener('error', onError)
  }, [status])

  const retry = () => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  return (
    <figure className="flex size-full flex-col">
      <div className="relative min-h-72 flex-1 overflow-hidden rounded-2xl border border-stellar-border/70 bg-[radial-gradient(circle_at_50%_40%,rgba(97,214,232,0.12),transparent_65%)]">
        {status === 'ready' ? (
          <model-viewer
            ref={viewerRef}
            src={model.url}
            alt={model.alt}
            camera-controls
            // The wheel must keep scrolling the journey: zooming would capture it (preventDefault).
            disable-zoom
            auto-rotate={!reduced || undefined}
            rotation-per-second="18deg"
            touch-action="pan-y"
            interaction-prompt="auto"
            shadow-intensity="1"
            loading="eager"
            style={{ width: '100%', height: '100%', minHeight: '18rem', background: 'transparent' }}
          />
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
        <div className="pointer-events-none absolute top-2 left-2">
          <DepictionBadge depiction={model.depiction} />
        </div>
      </div>
      <figcaption className="mt-2 space-y-1 text-xs text-moon-dust">
        {model.description && <p className="text-sm text-starlight/90">{model.description}</p>}
        <p>{t('journey.modelHelp')}</p>
        <p>
          {model.credit ? t('media.credit', { credit: model.credit }) : t('media.noCredit')} ·{' '}
          <a href={model.pageUrl} target="_blank" rel="noopener noreferrer" className="text-cosmic-indigo hover:underline">
            {t('media.viewOriginal')}
            <span className="sr-only"> {t('media.newTab')}</span>
          </a>
        </p>
      </figcaption>
    </figure>
  )
}
