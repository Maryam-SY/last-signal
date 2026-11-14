import { cn } from '@/lib/utils'

/**
 * Glow of the current world (or story step) over the living sky. The sky itself is drawn once
 * for the whole site by the layout (SpaceScene, US-5.11). Decorative only.
 */
export function SpaceBackdrop({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('story-ambient pointer-events-none fixed inset-0 z-0', className)} />
}
