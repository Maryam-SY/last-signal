import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMotionLoop } from '@/hooks/useMotionLoop'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { liteGraphics } from '@/lib/device'
import { cn } from '@/lib/utils'

export interface DepthScene {
  id: string
  label: string
}

export interface DepthLayer {
  id: string
  /** Index of the scene this layer belongs to (its focus point). */
  scene: number
  /** Extra depth behind (+) or in front of (-) the scene's focus plane, in scene units. */
  offset?: number
  className?: string
  children: ReactNode
}

interface DepthJourneyProps {
  scenes: readonly DepthScene[]
  layers: readonly DepthLayer[]
  navLabel: string
}

/** Scroll distance (vh) that moves the camera from one scene to the next. */
const SCENE_SCROLL_VH = 120
/** Distance (px) between two scenes along the z axis. */
const SCENE_DEPTH = 1500
const PERSPECTIVE = 1000

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/** Opacity as a function of the distance to the camera (in scene units, + = still ahead). */
function opacityAt(distance: number): number {
  if (distance >= 0) return clamp(1 - (distance - 0.25) / 0.6, 0, 1)
  return clamp(1 + (distance + 0.12) / 0.32, 0, 1)
}

/**
 * Scroll becomes a camera moving forward: the page never slides, the worlds come to the
 * viewer. A tall track provides the scroll distance; a sticky stage holds every layer in
 * 3D, and one rAF loop places them on the z axis. The native scrollbar is hidden and
 * replaced by a journey indicator. Keyboard focus moves the camera to the focused scene.
 *
 * Under `prefers-reduced-motion: reduce` the same scenes render as ordinary sections.
 */
export function DepthJourney({ scenes, layers, navLabel }: DepthJourneyProps) {
  const reduced = useReducedMotion()
  return reduced ? (
    <FlatJourney scenes={scenes} layers={layers} />
  ) : (
    <SpatialJourney scenes={scenes} layers={layers} navLabel={navLabel} />
  )
}

function FlatJourney({ scenes, layers }: Omit<DepthJourneyProps, 'navLabel'>) {
  return (
    <div>
      {scenes.map((scene, index) => (
        <section key={scene.id} className="relative grid min-h-dvh overflow-clip pt-16">
          {layers
            .filter((layer) => layer.scene === index)
            .map((layer) => (
              <div
                key={layer.id}
                className={cn('col-start-1 row-start-1 flex items-center justify-center', layer.className)}
              >
                {layer.children}
              </div>
            ))}
        </section>
      ))}
    </div>
  )
}

function SpatialJourney({ scenes, layers, navLabel }: DepthJourneyProps) {
  const [lite] = useState(liteGraphics)
  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const activeScene = useRef(-1)
  /** Last style key per layer, so unchanged frames do no DOM work. */
  const writtenRef = useRef<string[]>([])
  const lastScene = scenes.length - 1

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('depth-mode')
    return () => root.classList.remove('depth-mode')
  }, [])

  const sceneScrollPx = () => (window.innerHeight * SCENE_SCROLL_VH) / 100

  const goTo = (scene: number, smooth = true) => {
    const track = trackRef.current
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY + scene * sceneScrollPx()
    if (Math.abs(window.scrollY - top) < 4) return
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
  }

  useMotionLoop(({ velocity }) => {
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const camera = clamp(-track.getBoundingClientRect().top / sceneScrollPx(), 0, lastScene)
    const tilt = clamp(velocity, -40, 40)
    stage.style.setProperty('--vel', tilt.toFixed(1))

    layers.forEach((layer, index) => {
      const element = layerRefs.current[index]
      if (!element) return
      const distance = layer.scene + (layer.offset ?? 0) - camera
      const opacity = opacityAt(distance)
      // Phones: a scene passing the camera is magnified less (×2 instead of ×10 in width):
      // iPhone keeps an image of every layer at its drawn size and closed the page.
      const z = clamp(-distance * SCENE_DEPTH, -SCENE_DEPTH * 3, PERSPECTIVE * (lite ? 0.5 : 0.9))

      // No blur: filtering full-screen layers every frame is what made scrolling stutter.
      // Depth comes from z, opacity and the layers' own --pass/--approach transforms.
      const key = `${opacity.toFixed(2)}|${z.toFixed(0)}|${(tilt * 0.12).toFixed(1)}`
      if (writtenRef.current[index] === key) return
      writtenRef.current[index] = key

      element.style.opacity = opacity.toFixed(2)
      // A scene the camera cannot see is not drawn at all (no memory kept for it).
      element.style.visibility = opacity < 0.02 ? 'hidden' : 'visible'
      // Scenes the camera cannot see take no focus (WCAG 2.4.7/2.4.11).
      element.toggleAttribute('inert', opacity < 0.05)
      element.style.transform = `translate3d(0, 0, ${z.toFixed(0)}px) rotateX(${(tilt * 0.12).toFixed(2)}deg)`
      element.style.zIndex = String(Math.round(1000 - distance * 100))
      element.style.pointerEvents = opacity > 0.6 && distance > -0.15 ? 'auto' : 'none'
      element.style.setProperty('--pass', clamp(-distance / 0.4, 0, 1).toFixed(2))
      element.style.setProperty('--approach', clamp(distance, 0, 1).toFixed(2))
    })

    if (progressRef.current) {
      progressRef.current.style.transform = `scaleY(${(lastScene ? camera / lastScene : 1).toFixed(3)})`
    }
    const nearest = Math.round(camera)
    if (nearest !== activeScene.current) {
      activeScene.current = nearest
      dotRefs.current.forEach((dot, index) => {
        if (!dot) return
        if (index === nearest) dot.setAttribute('aria-current', 'step')
        else dot.removeAttribute('aria-current')
      })
    }
  })

  return (
    <div ref={trackRef} className="relative" style={{ height: `${100 + lastScene * SCENE_SCROLL_VH}vh` }}>
      <div
        ref={stageRef}
        className="sticky top-0 h-dvh overflow-clip"
        style={{ perspective: `${PERSPECTIVE}px` }}
      >
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            ref={(element) => {
              layerRefs.current[index] = element
            }}
            onFocus={() => goTo(layer.scene)}
            data-depth-layer=""
            className={cn(
              'absolute inset-0 flex items-center justify-center pt-16 opacity-0 will-change-transform',
              layer.className,
            )}
          >
            {layer.children}
          </div>
        ))}

        <nav aria-label={navLabel} className="absolute top-1/2 right-1 z-[2000] -translate-y-1/2 sm:right-4">
          <div aria-hidden="true" className="absolute top-5 bottom-5 left-1/2 w-px -translate-x-1/2 bg-moon-dust/20">
            <div ref={progressRef} className="h-full w-full origin-top bg-stellar-cyan" style={{ transform: 'scaleY(0)' }} />
          </div>
          <ol className="relative flex flex-col gap-3">
            {scenes.map((scene, index) => (
              <li key={scene.id}>
                <button
                  type="button"
                  ref={(element) => {
                    dotRefs.current[index] = element
                  }}
                  onClick={() => goTo(index)}
                  className="group relative flex size-11 items-center justify-center rounded-full"
                >
                  <span className="block size-2.5 rounded-full border border-moon-dust/70 bg-void transition-all group-hover:border-stellar-cyan group-aria-[current=step]:size-3.5 group-aria-[current=step]:border-stellar-cyan group-aria-[current=step]:bg-stellar-cyan" />
                  <span aria-hidden="true" className="pointer-events-none absolute right-full mr-1 hidden rounded bg-void/80 px-2 py-0.5 font-mono text-[0.6rem] tracking-widest whitespace-nowrap text-moon-dust uppercase group-hover:block group-focus-visible:block sm:mr-2 lg:group-aria-[current=step]:block">
                    {scene.label}
                  </span>
                  <span className="sr-only">{scene.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  )
}
