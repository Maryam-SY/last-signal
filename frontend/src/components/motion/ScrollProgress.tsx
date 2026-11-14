import { useRef } from 'react'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { cn } from '@/lib/utils'

/** Thin bar under the header that fills as the page is read. Decorative (aria-hidden). */
export function ScrollProgress({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useScrollFrame(({ scrollY, viewportH }) => {
    const max = document.documentElement.scrollHeight - viewportH
    const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
    ref.current?.style.setProperty('--progress', progress.toFixed(4))
  })

  return (
    <div aria-hidden="true" className={cn('pointer-events-none fixed inset-x-0 top-16 z-[2400] h-0.5', className)}>
      <div ref={ref} className="scroll-progress h-full bg-gradient-to-r from-cosmic-indigo via-world to-world" />
    </div>
  )
}
