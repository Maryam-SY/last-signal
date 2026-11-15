import { useEffect, useRef, useState } from 'react'
import { useMotionLoop } from '@/hooks/useMotionLoop'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { canUseWebGL } from '@/lib/device'
import { cn } from '@/lib/utils'
import type { SpaceScene as SpaceSceneInstance } from './space/createSpaceScene'
import { Starfield } from './Starfield'

/** NASA SVS Milky Way glow, stars removed (they are drawn sharp in 3D). */
const SKY_MAP = '/media/sky-milkyway-pano.webp'

/** Cruising speed through the star field (units per second), and the boost per px of scroll. */
const CRUISE = 14
const SCROLL_BOOST = 1.6

interface SpaceSceneProps {
  /** The home shows the sky brighter; reading pages dim it behind the text. */
  bright?: boolean
}

/**
 * The sky behind every page (US-5.11), mounted once by the layout so it keeps flying from one
 * page to the next: the NASA all-sky map turning slowly and 3D stars coming toward the viewer.
 * Scrolling down speeds the journey up, scrolling up sends it back. Until WebGL is ready (or
 * without WebGL) the still sky photograph and the flat starfield are shown. Under reduced
 * motion the scene is drawn once and stays still. Decorative.
 */
export function SpaceScene({ bright = false }: SpaceSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<SpaceSceneInstance | null>(null)
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  /** The still sky leaves once the live one has faded in over it. */
  const [stillRetired, setStillRetired] = useState(false)
  const motion = useRef({ time: 0, travel: 0, brightness: bright ? 1 : 0.35, scrollY: 0 })
  const brightRef = useRef(bright)
  const webgl = canUseWebGL()

  useEffect(() => {
    brightRef.current = bright
  }, [bright])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!webgl || !canvas) return
    let cancelled = false

    import('./space/createSpaceScene')
      .then(async ({ createSpaceScene, loadImage }) => {
        const image = await loadImage(SKY_MAP)
        if (cancelled) return
        const scene = createSpaceScene(canvas, image)
        sceneRef.current = scene
        const m = motion.current
        scene.render({ ...m, scrollY: window.scrollY })
        setReady(true)
      })
      .catch(() => {
        // No WebGL context or image: the still sky stays.
      })

    const onResize = () => {
      const scene = sceneRef.current
      if (!scene) return
      scene.resize()
      scene.render({ ...motion.current, scrollY: window.scrollY })
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      window.removeEventListener('resize', onResize)
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [webgl])

  useEffect(() => {
    if (!ready) return
    const timer = window.setTimeout(() => setStillRetired(true), 1100)
    return () => window.clearTimeout(timer)
  }, [ready])

  // Reduced motion: one still frame, redrawn when the page changes brightness.
  useEffect(() => {
    if (!reduced || !ready) return
    const m = motion.current
    m.brightness = bright ? 1 : 0.35
    sceneRef.current?.render({ ...m, scrollY: window.scrollY })
  }, [reduced, ready, bright])

  useMotionLoop(({ dt, velocity, scrollY }) => {
    const scene = sceneRef.current
    if (!scene) return
    const m = motion.current
    const seconds = dt / 1000
    m.time += seconds
    const boost = Math.max(-40, Math.min(40, velocity)) * SCROLL_BOOST
    m.travel += (CRUISE + boost) * seconds
    m.brightness += ((brightRef.current ? 1 : 0.35) - m.brightness) * Math.min(1, seconds * 2.5)
    m.scrollY = scrollY
    scene.render(m)
  })

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 bg-void">
      {!stillRetired && (
        <>
          <div className={cn('space-sky absolute inset-0', bright && '[--sky-veil:0.25]')} />
          <Starfield />
        </>
      )}
      {webgl && (
        <canvas
          ref={canvasRef}
          className={cn('absolute inset-0 size-full transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
        />
      )}
    </div>
  )
}
