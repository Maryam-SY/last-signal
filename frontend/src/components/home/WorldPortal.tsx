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

interface WorldPortalProps {
  id: DestinationId
  /** Accessible name of the link (DEST-003 / US-2.1 §4). */
  label: string
  className?: string
}

/**
 * A whole destination as one link (DEST-003): the living planet, its name and its action.
 * Hover and keyboard focus trigger the same effects; nothing essential is hover-only.
 * Activating it morphs the planet into the destination page (View Transitions, when supported).
 */
export function WorldPortal({ id, label, className }: WorldPortalProps) {
  const { t } = useTranslation()
  const body = getBodyByDestination(id)
  const [active, setActive] = useState(false)
  const pointer = useRef<PointerState>({ x: 0, y: 0 })
  const planetRef = useRef<HTMLDivElement>(null)

  if (!body) return null

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = planetRef.current?.getBoundingClientRect()
    if (!rect) return
    pointer.current = {
      x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1)),
    }
  }

  return (
    <Link
      to={paths.destination(id)}
      viewTransition
      aria-label={label}
      onClick={() => {
        if (planetRef.current) planetRef.current.style.viewTransitionName = WORLD_TRANSITION_NAME
      }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => {
        setActive(false)
        pointer.current = { x: 0, y: 0 }
      }}
      onPointerMove={onPointerMove}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        'group relative flex flex-col items-center rounded-3xl px-2 pt-2 pb-4 text-center outline-offset-4',
        className,
      )}
    >
      <div ref={planetRef} className="relative w-full max-w-[min(100%,28vh)]">
        {/* Orbit rings: decorative, they open up and spin while the world is active. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-6%] rounded-full border border-dashed border-stellar-cyan/0 transition-[border-color,transform] duration-700 group-hover:scale-105 group-hover:border-stellar-cyan/50 group-focus-visible:scale-105 group-focus-visible:border-stellar-cyan/50 motion-safe:animate-[spin_24s_linear_infinite]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-14%] rounded-full border border-moon-dust/0 transition-[border-color,transform] duration-700 group-hover:scale-100 group-hover:border-moon-dust/25 group-focus-visible:border-moon-dust/25 motion-safe:animate-[spin_40s_linear_infinite_reverse]"
        />
        <LivePlanet body={body} active={active} pointer={pointer} />
      </div>

      <span className="mt-3 font-mono text-[0.62rem] tracking-[0.3em] text-stellar-cyan uppercase sm:text-[0.68rem]">
        {t(`bodies.${id}.kind`)}
      </span>
      <span className="mt-1 font-heading text-[clamp(1.6rem,min(6vw,6vh),3rem)] leading-tight font-bold">{t(`destinations.${id}.name`)}</span>
      <span className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-moon-dust/40 px-4 text-sm font-medium transition-colors group-hover:border-stellar-cyan group-hover:bg-stellar-cyan group-hover:text-void group-focus-visible:border-stellar-cyan group-focus-visible:bg-stellar-cyan group-focus-visible:text-void">
        {label}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
