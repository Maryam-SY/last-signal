import { cn } from '@/lib/utils'

/**
 * The AeroReborn mark (DESIGN_SYSTEM §6): a lander shaped like the letter A, standing on a
 * world's horizon and still sending its signal — every machine passed something on.
 * Decorative (the link around it carries the name); the signal arcs light up in turn, unless
 * motion is reduced.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={cn('logo-mark shrink-0', className)}>
      <path d="M6 56 Q32 44 58 56" fill="none" stroke="#e5c58d" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <g fill="none" stroke="#f1f5f9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 47 L30 20 L41 47" strokeWidth="4.8" />
        <path d="M23.4 37 H36.6" strokeWidth="4" />
        <path d="M15.5 47.5 H22.5 M37.5 47.5 H44.5" strokeWidth="3" />
      </g>
      <g fill="none" stroke="#61d6e8" strokeLinecap="round" strokeWidth="3.4">
        <path className="logo-wave" d="M36 13.6 A9 9 0 0 1 40.2 22.5" />
        <path className="logo-wave logo-wave-far" d="M40.5 7.8 A16 16 0 0 1 47.6 23.5" />
      </g>
      <circle cx="30" cy="20" r="3.8" fill="#61d6e8" />
    </svg>
  )
}
