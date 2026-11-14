import { useEffect, useId, useRef } from 'react'
import type { CelestialBody } from '@/content/celestialBodies'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { cn } from '@/lib/utils'

interface PlanetProps {
  body: CelestialBody
  className?: string
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
export function Planet({ body, className }: PlanetProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const surfaceRef = useRef<SVGGElement>(null)
  const visibleRef = useRef(true)

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
    if (!visibleRef.current) return
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
    <div ref={wrapperRef} className={cn('relative aspect-square', className)}>
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
            <radialGradient id={shadeId} cx="32%" cy="26%" r="78%">
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
