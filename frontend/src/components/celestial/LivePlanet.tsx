import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import type { CelestialBody } from '@/content/celestialBodies'
import { useMotionLoop } from '@/hooks/useMotionLoop'
import { cn } from '@/lib/utils'
import { Planet, type PlanetHandle } from './Planet'

export interface PointerState {
  /** Pointer position over the target, -1 … 1 on each axis. */
  x: number
  y: number
}

interface LivePlanetProps {
  body: CelestialBody
  className?: string
  style?: CSSProperties
  /** Hovered or focused: the world spins faster, leans toward the pointer and ripples. */
  active?: boolean
  pointer?: RefObject<PointerState>
  /** Extra surface rotation per pixel scrolled (scroll-scrubbed spin). */
  spinPerPixel?: number
  /** Plays a warp ripple when mounted (used when arriving on a destination). */
  arrivalRipple?: boolean
}

const IDLE_SPIN = 4 // degrees per second
const ACTIVE_SPIN = 42
const MAX_TILT = 13 // degrees

/**
 * A Planet that lives: idle spin, hover acceleration, pointer tilt with a moving highlight,
 * and a liquid distortion driven by hover ripples and scroll speed. Everything is written
 * straight to the DOM from one rAF loop; nothing runs under reduced motion.
 */
export function LivePlanet({
  body,
  className,
  style,
  active = false,
  pointer,
  spinPerPixel = 0,
  arrivalRipple = false,
}: LivePlanetProps) {
  const handleRef = useRef<PlanetHandle>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  const state = useRef({
    angle: 0,
    spin: IDLE_SPIN,
    tiltX: 0,
    tiltY: 0,
    lift: 0,
    ripple: arrivalRipple ? 1.6 : 0,
  })

  useEffect(() => {
    // A fresh ripple every time the world becomes active.
    if (active && !activeRef.current) state.current.ripple = 1
    activeRef.current = active
  }, [active])

  useMotionLoop(({ dt, velocity }) => {
    const s = state.current
    const isActive = activeRef.current
    const ease = (rate: number) => 1 - Math.pow(1 - rate, dt / 16.67)

    s.spin += ((isActive ? ACTIVE_SPIN : IDLE_SPIN) - s.spin) * ease(0.05)
    s.angle = (s.angle + (s.spin * dt) / 1000 + velocity * spinPerPixel) % 360

    const target = isActive && pointer?.current ? pointer.current : { x: 0, y: 0 }
    s.tiltX += (target.x - s.tiltX) * ease(0.1)
    s.tiltY += (target.y - s.tiltY) * ease(0.1)
    s.lift += ((isActive ? 1 : 0) - s.lift) * ease(0.12)
    s.ripple *= Math.pow(0.95, dt / 16.67)

    const tilt = tiltRef.current
    if (tilt) {
      tilt.style.transform = `perspective(900px) rotateX(${(-s.tiltY * MAX_TILT).toFixed(2)}deg) rotateY(${(s.tiltX * MAX_TILT).toFixed(2)}deg) scale(${(1 + s.lift * 0.06).toFixed(3)})`
    }

    const handle = handleRef.current
    if (!handle) return
    handle.setSurface(s.angle, s.tiltX * 6, s.tiltY * 6)
    handle.setLight(32 - s.tiltX * 20, 26 - s.tiltY * 20)
    handle.setDistortion(s.ripple * 16 + Math.min(Math.abs(velocity) * 0.7, 26))
  })

  return (
    <div ref={tiltRef} className={cn('will-change-transform', className)} style={style}>
      <Planet body={body} parallax={false} distortion handleRef={handleRef} />
    </div>
  )
}
