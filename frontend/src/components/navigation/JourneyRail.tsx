import type { MouseEvent } from 'react'
import { scrollToSection, useActiveSection } from '@/hooks/useActiveSection'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/utils'

export interface RailItem {
  /** id of the section in the page (also the anchor). */
  id: string
  label: string
}

interface JourneyRailProps {
  items: readonly RailItem[]
  label: string
  className?: string
}

/**
 * Discreet vertical rail of the sections of a long immersive page: one dot per section,
 * the current one filled and enlarged (shape + colour, never colour alone), labels on
 * hover/focus. Plain anchors, so it also works without JavaScript.
 */
export function JourneyRail({ items, label, className }: JourneyRailProps) {
  const reduced = useReducedMotion()
  const active = useActiveSection(items.map((item) => item.id))
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === active))

  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    event.preventDefault()
    scrollToSection(target, reduced)
  }

  return (
    <nav aria-label={label} className={cn('fixed top-1/2 right-2 z-30 -translate-y-1/2 lg:right-5', className)}>
      <div aria-hidden="true" className="absolute top-5 bottom-5 left-1/2 w-px -translate-x-1/2 bg-moon-dust/20">
        <div
          className="h-full w-full origin-top bg-world transition-transform duration-500"
          style={{ transform: `scaleY(${items.length > 1 ? activeIndex / (items.length - 1) : 1})` }}
        />
      </div>
      <ol className="relative flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => onClick(event, item.id)}
              aria-current={item.id === active ? 'location' : undefined}
              className="group relative flex size-11 items-center justify-center rounded-full"
            >
              <span className="block size-2.5 rounded-full border border-moon-dust/70 bg-void transition-all group-hover:border-world group-aria-[current=location]:size-4 group-aria-[current=location]:border-world group-aria-[current=location]:bg-world group-aria-[current=location]:shadow-[0_0_14px_var(--world-accent)]" />
              <span
                aria-hidden="true"
                className="glass pointer-events-none absolute right-full mr-2 hidden rounded-full px-3 py-1 font-mono text-[0.62rem] tracking-widest whitespace-nowrap text-starlight uppercase group-hover:block group-focus-visible:block xl:group-aria-[current=location]:block"
              >
                {item.label}
              </span>
              <span className="sr-only">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
