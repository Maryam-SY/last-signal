import { useRef, useState, type PointerEvent } from 'react'
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
 * A whole destination as one link (DEST-003): the living planet and its name — clicking the
 * planet opens the world (US-5.13: no separate button; the opening scene only invites to
 * scroll). It turns at its real relative speed.
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
      <div ref={planetRef} className="relative w-full max-w-[min(100%,40vh)] transition-[filter] duration-500 group-hover:brightness-125 group-focus-visible:brightness-125">
        {/* Orbit rings: decorative, they open up and spin while the world is active. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-6%] rounded-full border border-dashed border-cosmic-cyan/0 transition-[border-color,transform] duration-700 group-hover:scale-105 group-hover:border-cosmic-cyan/50 group-focus-visible:scale-105 group-focus-visible:border-cosmic-cyan/50 motion-safe:animate-[spin_24s_linear_infinite]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-14%] rounded-full border border-moon-dust/0 transition-[border-color,transform] duration-700 group-hover:scale-100 group-hover:border-moon-dust/25 group-focus-visible:border-moon-dust/25 motion-safe:animate-[spin_40s_linear_infinite_reverse]"
        />
        <LivePlanet body={body} active={active} pointer={pointer} />
      </div>
      <span className="mt-1 font-heading text-[clamp(1.8rem,min(6.5vw,7vh),3.6rem)] leading-tight font-bold transition-colors group-hover:text-cosmic-cyan group-focus-visible:text-cosmic-cyan">
        {t(`destinations.${id}.name`)}
      </span>

    </Link>
  )
}
