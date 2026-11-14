import { useEffect, useId, useImperativeHandle, useRef, type CSSProperties, type Ref } from 'react'
import type { CelestialBody } from '@/content/celestialBodies'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { cn } from '@/lib/utils'

/** Imperative controls used by animated wrappers (see LivePlanet). All values are cheap DOM writes. */
export interface PlanetHandle {
  /** Turns the photographed surface under the fixed light (degrees) and nudges it (SVG units). */
  setSurface: (rotateDeg: number, offsetX: number, offsetY: number) => void
  /** Moves the specular highlight; values are percentages of the disc. */
  setLight: (cxPercent: number, cyPercent: number) => void
  /** Displacement strength of the warp filter (0 disables the filter). Requires `distortion`. */
  setDistortion: (scale: number) => void
}

interface PlanetProps {
  body: CelestialBody
  className?: string
  style?: CSSProperties
  /** Built-in scroll drift. Turn off when a parent drives the surface through `handleRef`. */
  parallax?: boolean
  /** Renders a turbulence/displacement filter that `setDistortion` can drive. */
  distortion?: boolean
  handleRef?: Ref<PlanetHandle>
}

function ringArc(rx: number, ry: number, half: 'back' | 'front'): string {
  const sweep = half === 'back' ? 1 : 0
  return `M ${-rx} 0 A ${rx} ${ry} 0 0 ${sweep} ${rx} 0`
}

/**
 * A real NASA/NSSDCA photograph wrapped in a CSS/SVG-only 3D illusion. There is no WebGL:
 * the sphere is the photo clipped to a disc, a radial gradient paints light and shadow, and
 * the photo drifts slightly on scroll behind the fixed shading. Rings are split into
 * back/front arcs. Bodies that are not spheres (comets, asteroids) are shown framed.
 */
export function Planet({
  body,
  className,
  style,
  parallax = true,
  distortion = false,
  handleRef,
}: PlanetProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<SVGGElement>(null)
  const shadeRef = useRef<SVGRadialGradientElement>(null)
  const warpGroupRef = useRef<SVGGElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null)
  const visibleRef = useRef(true)
  const warpId = `warp-${uid}`

  useImperativeHandle(
    handleRef,
    () => ({
      setSurface(rotateDeg, offsetX, offsetY) {
        surfaceRef.current?.setAttribute(
          'transform',
          `translate(${offsetX.toFixed(2)} ${offsetY.toFixed(2)}) rotate(${rotateDeg.toFixed(2)})`,
        )
      },
      setLight(cxPercent, cyPercent) {
        shadeRef.current?.setAttribute('cx', `${cxPercent.toFixed(1)}%`)
        shadeRef.current?.setAttribute('cy', `${cyPercent.toFixed(1)}%`)
      },
      setDistortion(scale) {
        const group = warpGroupRef.current
        const displacement = displacementRef.current
        if (!group || !displacement) return
        // Only pay for the filter while it is visible.
        if (scale < 0.15) {
          group.removeAttribute('filter')
          return
        }
        displacement.setAttribute('scale', scale.toFixed(2))
        group.setAttribute('filter', `url(#${warpId})`)
      },
    }),
    [warpId],
  )

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? false
      },
      { rootMargin: '25% 0px' },
    )
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  useScrollFrame(({ viewportH }) => {
    if (!parallax || !visibleRef.current) return
    const wrapper = wrapperRef.current
    const surface = surfaceRef.current
    if (!wrapper || !surface) return
    const rect = wrapper.getBoundingClientRect()
    const progress = (viewportH / 2 - (rect.top + rect.height / 2)) / Math.max(viewportH, 1)
    const clamped = Math.max(-1.4, Math.min(1.4, progress))
    const drift = body.imageMode === 'sphere' ? 7 : 12
    surface.setAttribute('transform', `translate(${(-clamped * drift).toFixed(2)} 0)`)
    wrapper.style.transform = `translate3d(0, ${(clamped * -20).toFixed(2)}px, 0)`
  })

  const { palette, rings, image, imageMode } = body
  const clipId = `clip-${uid}`
  const shadeId = `shade-${uid}`
  const baseId = `base-${uid}`
  const fadeId = `fade-${uid}`
  const maskId = `mask-${uid}`
  const isSphere = imageMode === 'sphere'

  return (
    <div ref={wrapperRef} className={cn('relative aspect-square', className)} style={style}>
      <div
        aria-hidden="true"
        className="absolute inset-[6%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${palette.base}55, transparent 70%)` }}
      />
      <div className="planet-float relative h-full w-full">
        <svg
          viewBox="-110 -110 220 220"
          role="presentation"
          aria-hidden="true"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <clipPath id={clipId}>
              <circle r={82} />
            </clipPath>
            <radialGradient ref={shadeRef} id={shadeId} cx="32%" cy="26%" r="78%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="74%" stopColor={palette.dark} stopOpacity="0.12" />
              <stop offset="100%" stopColor={palette.dark} stopOpacity="0.72" />
            </radialGradient>
            <radialGradient id={baseId} cx="50%" cy="50%" r="50%">
              <stop offset="74%" stopColor={palette.dark} stopOpacity="0" />
              <stop offset="100%" stopColor={palette.dark} stopOpacity="0.45" />
            </radialGradient>
            <radialGradient id={fadeId} cx="50%" cy="50%" r="52%">
              <stop offset="58%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {distortion && (
              <filter id={warpId} x="-15%" y="-15%" width="130%" height="130%">
                <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves={2} seed={7} result="noise" />
                <feDisplacementMap
                  ref={displacementRef}
                  in="SourceGraphic"
                  in2="noise"
                  scale={0}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            )}
            <mask id={maskId}>
              <rect x={-110} y={-110} width={220} height={220} fill={`url(#${fadeId})`} />
            </mask>
          </defs>

          {rings && (
            <g transform={`rotate(${rings.tilt})`} opacity={rings.opacity} aria-hidden="true">
              {[rings.outer, (rings.outer + rings.inner) / 2, rings.inner].map((radius, index) => (
                <path
                  key={`back-${index}`}
                  d={ringArc(radius, radius * 0.24, 'back')}
                  fill="none"
                  stroke={rings.color}
                  strokeWidth={index === 1 ? rings.width : rings.width * 0.5}
                  strokeLinecap="round"
                  opacity={index === 1 ? 1 : 0.75}
                />
              ))}
            </g>
          )}

          <g ref={warpGroupRef}>
          {isSphere ? (
            <>
              <circle r={82} fill={palette.base} />
              <g clipPath={`url(#${clipId})`}>
                <g ref={surfaceRef}>
                  <image
                    href={image}
                    x={-92}
                    y={-92}
                    width={184}
                    height={184}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              </g>
              <circle r={82} fill={`url(#${shadeId})`} />
              <circle r={82} fill={`url(#${baseId})`} />
              <circle r={82} fill="none" stroke={palette.dark} strokeOpacity={0.3} strokeWidth={1.5} />
            </>
          ) : (
            <g ref={surfaceRef} mask={`url(#${maskId})`}>
              <image
                href={image}
                x={-104}
                y={-104}
                width={208}
                height={208}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          )}
          </g>

          {rings && (
            <g transform={`rotate(${rings.tilt})`} opacity={rings.opacity} aria-hidden="true">
              {[rings.outer, (rings.outer + rings.inner) / 2, rings.inner].map((radius, index) => (
                <path
                  key={`front-${index}`}
                  d={ringArc(radius, radius * 0.24, 'front')}
                  fill="none"
                  stroke={rings.color}
                  strokeWidth={index === 1 ? rings.width : rings.width * 0.5}
                  strokeLinecap="round"
                  opacity={index === 1 ? 1 : 0.75}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
