import { useRef } from 'react'
import { LivePlanet } from '@/components/celestial/LivePlanet'
import { WORLD_TRANSITION_NAME } from '@/components/home/worldTransition'
import type { CelestialBody } from '@/content/celestialBodies'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { cn } from '@/lib/utils'

/** Marks the element that carries the planet morph, so another link can take it over. */
export const WORLD_FOCUS_ATTR = 'data-world-focus'

/**
 * The destination's planet, pinned to the screen (US-5.6): it fills the hero, then sinks
 * into a dim horizon behind the missions as the visitor scrolls (CSS `.dest-planet`, driven
 * by one `--p` variable). Under reduced motion the page renders `StaticDestinationPlanet`
 * in the hero instead.
 */
export function PinnedDestinationPlanet({ body }: { body: CelestialBody }) {
  const ref = useRef<HTMLDivElement>(null)

  useScrollFrame(({ scrollY, viewportH }) => {
    const p = Math.min(1, Math.max(0, scrollY / (viewportH * 0.85)))
    ref.current?.style.setProperty('--p', p.toFixed(3))
  })

  return (
    <div
      ref={ref}
      aria-hidden="true"
      {...{ [WORLD_FOCUS_ATTR]: '' }}
      className="dest-planet"
      style={{ viewTransitionName: WORLD_TRANSITION_NAME }}
    >
      <LivePlanet body={body} arrivalRipple spinPerPixel={0.06} />
    </div>
  )
}

export function StaticDestinationPlanet({ body, className }: { body: CelestialBody; className?: string }) {
  return (
    <div
      aria-hidden="true"
      {...{ [WORLD_FOCUS_ATTR]: '' }}
      className={cn('mx-auto w-[min(60vw,34vh,26rem)]', className)}
      style={{ viewTransitionName: WORLD_TRANSITION_NAME }}
    >
      <LivePlanet body={body} />
    </div>
  )
}
