import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { LivePlanet, type PointerState } from '@/components/celestial/LivePlanet'
import { getBodyByDestination } from '@/content/celestialBodies'
import { MousePointerClick } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { DestinationId } from '@/types/content'
import { WORLD_TRANSITION_NAME } from './worldTransition'

interface WorldChapterProps {
  id: DestinationId
  number: number
  reversed?: boolean
}

/**
 * One destination as a scene of the depth journey: a large living planet (turning at its real
 * speed; clicking it opens the world — US-5.13: no separate button) next to its name, kind and
 * short description. The planet grows faster than the
 * text when the camera passes (CSS `--pass`), which separates the two planes.
 */
export function WorldChapter({ id, number, reversed = false }: WorldChapterProps) {
  const { t } = useTranslation()
  const body = getBodyByDestination(id)
  const [active, setActive] = useState(false)
  const pointer = useRef<PointerState>({ x: 0, y: 0 })
  const planetRef = useRef<HTMLDivElement>(null)
  const titleId = `chapter-${id}-title`
  const land = t(`destinations.${id}.land`)

  if (!body) return null

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointer.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }

  const markTransition = () => {
    if (planetRef.current) planetRef.current.style.viewTransitionName = WORLD_TRANSITION_NAME
  }

  return (
    <section
      aria-labelledby={titleId}
      className="mx-auto grid w-full max-w-6xl items-center gap-4 px-5 sm:gap-8 lg:grid-cols-2 lg:gap-16"
    >
      <div
        className={cn('chapter-planet planet-glow mx-auto w-[min(84vw,54vh,40rem)]', reversed && 'lg:order-2')}
        style={{ '--glow': id === 'moon' ? '#e2e8f0' : '#d97757' } as CSSProperties}
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => {
          setActive(false)
          pointer.current = { x: 0, y: 0 }
        }}
        onPointerMove={onPointerMove}
      >
        <Link
          to={paths.destination(id)}
          viewTransition
          aria-label={land}
          onClick={markTransition}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          className="block cursor-pointer rounded-full outline-offset-8"
        >
          <div ref={planetRef} className="group relative transition-[filter] duration-500 hover:brightness-125">
            <LivePlanet body={body} active={active} pointer={pointer} spinPerPixel={0.12} />
          </div>
        </Link>
      </div>

      <div className={cn('text-center lg:text-left', reversed && 'lg:order-1')}>
        <p className="font-mono text-[0.72rem] tracking-[0.35em] text-cosmic-cyan uppercase">
          {t('explore.chapter', { number: String(number).padStart(2, '0') })}
        </p>
        <h2 id={titleId} className="velocity-skew mt-3 font-heading text-5xl leading-none font-bold sm:text-7xl">
          {t(`destinations.${id}.name`)}
        </h2>
        <p className="text-legible mx-auto mt-4 max-w-md text-sm text-starlight/90 sm:text-lg lg:mx-0">
          {t(`bodies.${id}.description`)}
        </p>
        {/* US-5.13: a small, quiet cue — the planet itself opens its story. */}
        <p className="mt-5 inline-flex items-center gap-2 text-sm text-moon-dust">
          <MousePointerClick aria-hidden="true" className="size-4 text-world" />
          {t(`explore.enter.${id}`)}
        </p>

      </div>
    </section>
  )
}

/** Huge outlined name drifting far behind a chapter — pure decoration. */
export function WorldEcho({ id }: { id: DestinationId }) {
  const { t } = useTranslation()
  return (
    <span
      aria-hidden="true"
      className="world-echo font-heading text-[34vw] leading-none font-bold tracking-tighter text-transparent uppercase select-none lg:text-[24vw]"
    >
      {t(`destinations.${id}.name`)}
    </span>
  )
}
