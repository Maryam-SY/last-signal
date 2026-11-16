import { useId } from 'react'
import { cn } from '@/lib/utils'

const ORBIT_TILT = 'rotate(-24 32 32)'
/** The orbit, split in two: the far half passes behind the ring, the near half in front of it. */
const ORBIT_FAR = 'M3 32 A29 8.5 0 0 1 61 32'
const ORBIT_NEAR = 'M61 32 A29 8.5 0 0 1 3 32'

/**
 * The OrbeMoria mark (DESIGN_SYSTEM §6), taken from the "O" of the logo: a ring crossed by a
 * pale-gold orbit, with a cyan star at its heart — the memory each machine left behind.
 * Decorative (the link around it carries the name); the star twinkles, unless motion is reduced.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  const cut = `${id}-cut`
  const glow = `${id}-glow`
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={cn('logo-mark shrink-0', className)}>
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#f2c879" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f2c879" stopOpacity="0" />
        </radialGradient>
        <mask id={cut}>
          <rect width="64" height="64" fill="#fff" />
          <path transform={ORBIT_TILT} d={ORBIT_NEAR} fill="none" stroke="#000" strokeWidth="7" />
        </mask>
      </defs>
      <path transform={ORBIT_TILT} d={ORBIT_FAR} fill="none" stroke="#e8d6a5" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="#f1f5f9" strokeWidth="5.6" mask={`url(#${cut})`} />
      <path transform={ORBIT_TILT} d={ORBIT_NEAR} fill="none" stroke="#e8d6a5" strokeWidth="3.2" strokeLinecap="round" />
      <g className="logo-star">
        <circle cx="32" cy="32" r="7.5" fill={`url(#${glow})`} />
        <path d="M32 25 Q32.9 31.1 39 32 Q32.9 32.9 32 39 Q31.1 32.9 25 32 Q31.1 31.1 32 25Z" fill="#fff6e0" />
      </g>
    </svg>
  )
}
