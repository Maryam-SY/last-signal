import { useRef } from 'react'
import { useScrollFrame } from '@/hooks/useScrollFrame'

/** Small deterministic PRNG so the starfield is identical on every render. */
function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface StarLayer {
  backgroundImage: string
  backgroundSize: string
  speed: number
}

function buildStarLayer(
  seed: number,
  count: number,
  tile: number,
  maxRadius: number,
  opacity: number,
  speed: number,
): StarLayer {
  const random = mulberry32(seed)
  const gradients: string[] = []

  for (let index = 0; index < count; index += 1) {
    const x = Math.round(random() * tile)
    const y = Math.round(random() * tile)
    const radius = (maxRadius * (0.4 + random() * 0.6)).toFixed(2)
    const alpha = (opacity * (0.45 + random() * 0.55)).toFixed(2)
    gradients.push(
      `radial-gradient(${radius}px ${radius}px at ${x}px ${y}px, rgba(241,245,249,${alpha}) 0%, transparent 100%)`,
    )
  }

  return {
    backgroundImage: gradients.join(', '),
    backgroundSize: `${tile}px ${tile}px`,
    speed,
  }
}

const LAYERS: readonly StarLayer[] = [
  buildStarLayer(11, 70, 340, 1.1, 0.75, 0.05),
  buildStarLayer(29, 46, 520, 1.5, 0.6, 0.13),
  buildStarLayer(53, 26, 700, 2.2, 0.5, 0.24),
]

const GLOWS = [
  {
    className: 'left-[-18%] top-[6%] h-[42rem] w-[42rem]',
    color: 'rgba(139,157,255,0.16)',
    speed: 0.06,
  },
  {
    className: 'right-[-20%] top-[42%] h-[38rem] w-[38rem]',
    color: 'rgba(181,138,255,0.14)',
    speed: 0.1,
  },
  {
    className: 'left-[12%] top-[78%] h-[34rem] w-[34rem]',
    color: 'rgba(97,214,232,0.1)',
    speed: 0.04,
  },
] as const

/**
 * Fixed, infinite starfield. Three tiled layers move at different speeds while scrolling,
 * which produces the depth/parallax without any canvas or WebGL.
 */
export function Starfield() {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])
  const glowRefs = useRef<Array<HTMLDivElement | null>>([])

  useScrollFrame(({ scrollY }) => {
    layerRefs.current.forEach((element, index) => {
      if (!element) return
      const layer = LAYERS[index]
      if (!layer) return
      element.style.backgroundPosition = `0 ${(scrollY * layer.speed).toFixed(1)}px`
    })
    glowRefs.current.forEach((element, index) => {
      if (!element) return
      const glow = GLOWS[index]
      if (!glow) return
      element.style.transform = `translate3d(0, ${(scrollY * glow.speed).toFixed(1)}px, 0)`
    })
  })

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {GLOWS.map((glow, index) => (
        <div
          key={glow.className}
          ref={(element) => {
            glowRefs.current[index] = element
          }}
          className={`absolute rounded-full blur-[110px] ${glow.className}`}
          style={{ background: `radial-gradient(circle, ${glow.color}, transparent 70%)` }}
        />
      ))}
      {LAYERS.map((layer, index) => (
        <div
          key={layer.backgroundSize}
          ref={(element) => {
            layerRefs.current[index] = element
          }}
          className="absolute inset-0"
          style={{
            backgroundImage: layer.backgroundImage,
            backgroundSize: layer.backgroundSize,
            backgroundRepeat: 'repeat',
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_0%,rgba(8,11,18,0.55)_95%)]" />
    </div>
  )
}
