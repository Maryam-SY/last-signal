import { useRef, useState } from 'react'
import { useScrollFrame } from '@/hooks/useScrollFrame'

/** Small deterministic PRNG so the starfield is identical on every visit. */
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

interface LayerSpec {
  seed: number
  count: number
  /** Tile size in CSS pixels; the tile repeats over the whole screen. */
  tile: number
  maxRadius: number
  opacity: number
  /** Parallax speed (fraction of the scroll). */
  speed: number
  twinkle?: boolean
}

const LAYERS: readonly LayerSpec[] = [
  { seed: 11, count: 90, tile: 360, maxRadius: 0.9, opacity: 0.8, speed: 0.04 },
  { seed: 29, count: 46, tile: 520, maxRadius: 1.3, opacity: 0.75, speed: 0.1, twinkle: true },
  { seed: 53, count: 18, tile: 720, maxRadius: 1.9, opacity: 0.9, speed: 0.2 },
]

/** Star tints: most are white, some slightly blue or warm, like a real sky. */
const TINTS = ['241,245,249', '241,245,249', '241,245,249', '200,215,255', '255,228,200']

/**
 * Paints one tile of stars once, into a small canvas, and returns it as an image URL.
 * Painting is done a single time per visit; scrolling then only moves the layer (GPU).
 */
function paintTile(spec: LayerSpec, ratio: number): string | null {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(spec.tile * ratio)
  canvas.height = Math.round(spec.tile * ratio)
  const context = canvas.getContext('2d')
  if (!context) return null
  context.scale(ratio, ratio)
  const random = mulberry32(spec.seed)
  for (let index = 0; index < spec.count; index += 1) {
    const x = random() * spec.tile
    const y = random() * spec.tile
    const radius = spec.maxRadius * (0.35 + random() * 0.65)
    const alpha = spec.opacity * (0.4 + random() * 0.6)
    const tint = TINTS[Math.floor(random() * TINTS.length)]
    const glow = context.createRadialGradient(x, y, 0, x, y, radius * 2.6)
    glow.addColorStop(0, `rgba(${tint},${alpha})`)
    glow.addColorStop(0.35, `rgba(${tint},${alpha * 0.45})`)
    glow.addColorStop(1, `rgba(${tint},0)`)
    context.fillStyle = glow
    context.fillRect(x - radius * 3, y - radius * 3, radius * 6, radius * 6)
  }
  return canvas.toDataURL('image/png')
}

/**
 * Fixed, infinite starfield over the sky photograph. Each layer is a pre-painted tile; while
 * scrolling, layers only slide (`transform`, composited on the GPU) at different speeds, which
 * gives the depth without repainting anything. Decorative.
 */
export function Starfield() {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])
  // Painted once, on the first render (a few ms); never repainted afterwards.
  const [tiles] = useState(() => {
    if (typeof document === 'undefined') return []
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    return LAYERS.map((spec) => paintTile(spec, ratio))
  })

  useScrollFrame(({ scrollY }) => {
    layerRefs.current.forEach((element, index) => {
      const spec = LAYERS[index]
      if (!element || !spec) return
      const offset = (scrollY * spec.speed) % spec.tile
      element.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`
    })
  })

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {LAYERS.map((spec, index) => {
        const tile = tiles[index]
        if (!tile) return null
        return (
          <div
            key={spec.seed}
            ref={(element) => {
              layerRefs.current[index] = element
            }}
            className={spec.twinkle ? 'star-twinkle absolute inset-x-0 top-0 will-change-transform' : 'absolute inset-x-0 top-0 will-change-transform'}
            style={{
              height: `calc(100% + ${spec.tile}px)`,
              backgroundImage: `url(${tile})`,
              backgroundSize: `${spec.tile}px ${spec.tile}px`,
              backgroundRepeat: 'repeat',
            }}
          />
        )
      })}
    </div>
  )
}
