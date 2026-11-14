import { useRef, useState, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { LivePlanet, type PointerState } from '@/components/celestial/LivePlanet'
import { getBodyByDestination } from '@/content/celestialBodies'
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
 * One destination as a scene of the depth journey: a large living planet (it turns as you
 * scroll) next to its name, kind and short description. The planet grows faster than the
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
        className={cn('chapter-planet mx-auto w-[min(72vw,40vh,30rem)]', reversed && 'lg:order-2')}
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
          tabIndex={-1}
          aria-hidden="true"
          onClick={markTransition}
          className="block cursor-pointer"
        >
          <div ref={planetRef}>
            <LivePlanet body={body} active={active} pointer={pointer} spinPerPixel={0.12} />
          </div>
        </Link>
      </div>

      <div className={cn('text-center lg:text-left', reversed && 'lg:order-1')}>
        <p className="font-mono text-[0.65rem] tracking-[0.35em] text-stellar-cyan uppercase">
          {t('explore.chapter', { number: String(number).padStart(2, '0') })} · {t(`bodies.${id}.kind`)}
        </p>
        <h2 id={titleId} className="velocity-skew mt-3 font-heading text-5xl leading-none font-bold sm:text-7xl">
          {t(`destinations.${id}.name`)}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-moon-dust sm:text-lg lg:mx-0">
          {t(`bodies.${id}.description`)}
        </p>
        <Link
          to={paths.destination(id)}
          viewTransition
          onClick={markTransition}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          className="group mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-moon-dust/40 px-5 text-sm font-medium transition-colors hover:border-stellar-cyan hover:bg-stellar-cyan hover:text-void focus-visible:border-stellar-cyan"
        >
          {land}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
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
