import type { ReactNode } from 'react'

/**
 * The only place where the animation between steps lives (ARCHITECTURE §10, ADR-014): a short
 * fade + rise (≤ 200 ms, opacity/transform), removed under prefers-reduced-motion. The key
 * remounts the content on every step change.
 */
export function StoryTransition({ stepKey, children }: { stepKey: string; children: ReactNode }) {
  return (
    <div key={stepKey} className="animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none">
      {children}
    </div>
  )
}
