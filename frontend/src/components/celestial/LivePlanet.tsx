import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { CelestialBody } from '@/content/celestialBodies'
import { useMotionLoop } from '@/hooks/useMotionLoop'
import { liteGraphics } from '@/lib/device'
import { cn } from '@/lib/utils'
import type { GlobeInstance } from './globe/createGlobe'
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
  /** Hovered or focused: the world leans toward the pointer and ripples (and spins faster, unless it turns at its real speed). */
  active?: boolean
  pointer?: RefObject<PointerState>
  /** Extra surface rotation per pixel scrolled (scroll-scrubbed spin). */
  spinPerPixel?: number
  /** Plays a warp ripple when mounted (used when arriving on a destination). */
  arrivalRipple?: boolean
  /** May load the 4k map when drawn large (the destination page's own planet only). */
  hd?: boolean
}

const IDLE_SPIN = 4 // degrees per second
const ACTIVE_SPIN = 42
const MAX_TILT = 13 // degrees

/** WebGL can be used (false in tests and very old browsers: the photo planet stays). */
function canUseWebGL(): boolean {
  return typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined'
}

/**
 * A world that lives: idle spin, hover acceleration, pointer tilt and a ripple on hover or
 * arrival. Worlds with a `globe` (Moon, Mars) are real 3D globes lit by a sun (three.js,
 * loaded on demand when the world first comes into view); until the globe is ready — or when
 * WebGL is missing — the photographed SVG planet is shown. Everything is written straight to
 * the DOM/GPU from one shared rAF loop; under reduced motion the globe is drawn once, still.
 */
export function LivePlanet({
  body,
  className,
  style,
  active = false,
  pointer,
  spinPerPixel = 0,
  arrivalRipple = false,
  hd = false,
}: LivePlanetProps) {
  const handleRef = useRef<PlanetHandle>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<GlobeInstance | null>(null)
  const activeRef = useRef(active)
  const visibleRef = useRef(false)
  /** Home depth journey: the layer holding this world (its inline opacity says if it is seen). */
  const layerRef = useRef<HTMLElement | null>(null)
  const lastTilt = useRef('')
  const [seen, setSeen] = useState(false)
  const [globeReady, setGlobeReady] = useState(false)
  /** The photo planet leaves the DOM once the globe has faded in over it. */
  const [photoRetired, setPhotoRetired] = useState(false)
  const useGlobe = body.globe !== undefined && canUseWebGL()
  // Phones: a globe exists only while it is actually seen, and is released (its WebGL context
  // and textures freed) a moment after it leaves the screen; the photo planet stands in.
  const [lite] = useState(liteGraphics)
  const [live, setLive] = useState(false)
  // A released WebGL context stays lost on its canvas: each new globe gets a fresh <canvas>.
  const [generation, setGeneration] = useState(0)
  const liveRef = useRef(false)
  const hiddenSince = useRef<number | null>(null)
  // US-5.13: worlds with a known rotation turn at their real relative speed (1 s = 1 h), always.
  const realSpin = body.rotationHours ? 360 / body.rotationHours : null
  const state = useRef({
    angle: body.id === 'mars' ? 210 : 0,
    spin: realSpin ?? IDLE_SPIN,
    tiltX: 0,
    tiltY: 0,
    lift: 0,
    ripple: arrivalRipple ? 1.6 : 0,
  })

  // Skip the whole simulation while the world is off-screen; create the globe on first sight.
  useEffect(() => {
    const tilt = tiltRef.current
    layerRef.current = tilt?.closest<HTMLElement>('[data-depth-layer]') ?? null
    if (!tilt || typeof IntersectionObserver === 'undefined') {
      visibleRef.current = true
      setSeen(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0]?.isIntersecting ?? false
        visibleRef.current = visible
        if (visible) setSeen(true)
      },
      { rootMargin: '25% 0px' },
    )
    observer.observe(tilt)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const config = body.globe
    const canvas = canvasRef.current
    if (!useGlobe || !seen || !config || !canvas || (lite && !live)) return
    let cancelled = false
    let instance: GlobeInstance | null = null

    import('./globe/createGlobe')
      .then(async ({ createGlobe, globeMapUrl, globePixelRatio }) => {
        // Layout width (transforms ignored), in device pixels.
        const size = canvas.clientWidth * globePixelRatio()
        const created = await createGlobe(canvas, config, globeMapUrl(config, hd ? size : 0))
        if (cancelled) {
          created.dispose()
          return
        }
        instance = created
        globeRef.current = created
        const s = state.current
        created.render({ spin: s.angle, tiltX: s.tiltX, tiltY: s.tiltY })
        setGlobeReady(true)
      })
      .catch(() => {
        // No WebGL context or texture: keep the photographed planet.
      })

    const onResize = () => {
      if (!instance) return
      instance.resize()
      const s = state.current
      instance.render({ spin: s.angle, tiltX: s.tiltX, tiltY: s.tiltY })
    }
    // Follows the canvas' own layout size (window resizes, responsive layouts).
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize)
    observer?.observe(canvas)

    return () => {
      cancelled = true
      observer?.disconnect()
      instance?.dispose()
      globeRef.current = null
    }
  }, [useGlobe, seen, body.globe, hd, lite, live, generation])

  useEffect(() => {
    if (!globeReady) return
    const timer = window.setTimeout(() => setPhotoRetired(true), 800)
    return () => window.clearTimeout(timer)
  }, [globeReady])

  useEffect(() => {
    // A fresh ripple every time the world becomes active.
    if (active && !activeRef.current) state.current.ripple = 1
    activeRef.current = active
  }, [active])

  useMotionLoop(({ dt, velocity }) => {
    if (lite) {
      const layer = layerRef.current
      const drawn = visibleRef.current && !(layer && Number(layer.style.opacity || '0') < 0.02)
      if (drawn) {
        hiddenSince.current = null
        if (!liveRef.current) {
          liveRef.current = true
          setLive(true)
        }
      } else if (liveRef.current) {
        const now = performance.now()
        hiddenSince.current ??= now
        if (now - hiddenSince.current > 1500) {
          liveRef.current = false
          globeRef.current = null
          setLive(false)
          setGeneration((value) => value + 1)
          setGlobeReady(false)
          setPhotoRetired(false)
        }
      }
    }
    if (!visibleRef.current) return
    // Every scene of the home journey is "on screen"; only draw the ones the camera can see.
    const layer = layerRef.current
    if (layer && Number(layer.style.opacity || '0') < 0.02) return
    const s = state.current
    const isActive = activeRef.current
    const ease = (rate: number) => 1 - Math.pow(1 - rate, dt / 16.67)

    s.spin += ((realSpin ?? (isActive ? ACTIVE_SPIN : IDLE_SPIN)) - s.spin) * ease(0.05)
    s.angle = (s.angle + (s.spin * dt) / 1000 + (realSpin ? 0 : velocity * spinPerPixel)) % 360

    const target = isActive && pointer?.current ? pointer.current : { x: 0, y: 0 }
    s.tiltX += (target.x - s.tiltX) * ease(0.1)
    s.tiltY += (target.y - s.tiltY) * ease(0.1)
    s.lift += ((isActive ? 1 : 0) - s.lift) * ease(0.12)
    s.ripple *= Math.pow(0.95, dt / 16.67)

    const globe = globeRef.current
    const tilt = tiltRef.current
    if (tilt) {
      // The 3D globe leans by itself; the CSS tilt is only for the flat photo planet.
      const scale = 1 + s.lift * 0.06 + (globe ? s.ripple * 0.012 : 0)
      const next = globe
        ? `scale(${scale.toFixed(3)})`
        : `perspective(900px) rotateX(${(-s.tiltY * MAX_TILT).toFixed(1)}deg) rotateY(${(s.tiltX * MAX_TILT).toFixed(1)}deg) scale(${scale.toFixed(3)})`
      // Idle worlds settle into a stable transform: stop writing it.
      if (next !== lastTilt.current) {
        lastTilt.current = next
        tilt.style.transform = next
      }
    }

    if (globe) {
      globe.render({ spin: s.angle, tiltX: s.tiltX, tiltY: s.tiltY })
      return
    }
    const handle = handleRef.current
    if (!handle) return
    handle.setSurface(s.angle, s.tiltX * 6, s.tiltY * 6)
    handle.setLight(32 - s.tiltX * 20, 26 - s.tiltY * 20)
    handle.setDistortion(s.ripple * 16 + Math.min(Math.abs(velocity) * 0.7, 26))
  })

  return (
    <div ref={tiltRef} className={cn('relative aspect-square will-change-transform', className)} style={style}>
      {globeReady && (
        // Soft light around the world, in its own colour (a wide gradient, no blur filter: a
        // blurred layer per globe cost a lot of memory on phones).
        <div
          aria-hidden="true"
          className="absolute -inset-[12%] rounded-full"
          style={{ background: `radial-gradient(circle, ${body.palette.base}40 30%, transparent 68%)` }}
        />
      )}
      {!photoRetired && (
        <Planet
          body={body}
          parallax={false}
          distortion
          handleRef={handleRef}
          className={cn('absolute inset-0 transition-opacity duration-700', globeReady && 'opacity-0')}
        />
      )}
      {useGlobe && (
        <canvas
          key={generation}
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            'globe-float absolute inset-0 size-full transition-opacity duration-700 ease-out',
            globeReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
