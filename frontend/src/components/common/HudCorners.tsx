import { cn } from '@/lib/utils'

/**
 * Four thin corner brackets, like the frame of a targeting or telemetry display (US-5.14 art
 * direction). Purely decorative; the parent must be `position: relative`.
 */
export function HudCorners({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('hud-corners', className)}>
      <i />
      <i />
      <i />
      <i />
    </span>
  )
}
