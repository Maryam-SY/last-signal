import { cn } from '@/lib/utils'
import { Starfield } from './Starfield'

/**
 * Fixed deep-space backdrop for every page except the home journey: the parallax starfield
 * plus a soft glow in the accent of the current world (or story step). Decorative only.
 */
export function SpaceBackdrop({ className }: { className?: string }) {
  return (
    <>
      {/* The sky of the intro video, behind every page (US-2.4). */}
      <div aria-hidden="true" className="space-sky pointer-events-none fixed inset-0 z-0" />
      <Starfield />
      <div aria-hidden="true" className={cn('story-ambient pointer-events-none fixed inset-0 z-0', className)} />
    </>
  )
}
