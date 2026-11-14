import type { MouseEvent } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { scrollToSection, useActiveSection } from '@/hooks/useActiveSection'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
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
 * The only navigation of an immersive page (US-5.6, US-5.9): on the right, one dot per
 * section (current one filled and enlarged — shape + colour) between "previous" and "next"
 * buttons; on phones, a floating pill at the bottom right with the same two buttons and
 * the current section's name. Dots are plain anchors, so they work without JavaScript.
 *
 * The current section's label stays visible only from 1680 px, the width from which a
 * 14rem label fits between the page content and the rail (pages reserve the rail's gutter
 * with `md:pr-16 lg:pr-20`); it is truncated there and shown in full on hover/focus.
 */
export function JourneyRail({ items, label, className }: JourneyRailProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const active = useActiveSection(items.map((item) => item.id))
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === active))
  const previous = items[activeIndex - 1]
  const next = active === null ? items[0] : items[activeIndex + 1]

  const go = (id: string) => scrollToSection(document.getElementById(id), reduced)
  const onAnchor = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!document.getElementById(id)) return
    event.preventDefault()
    go(id)
  }

  const stepButton = (target: RailItem | undefined, direction: 'previous' | 'next', extra?: string) => {
    const Icon = direction === 'previous' ? ChevronUp : ChevronDown
    return (
      <button
        type="button"
        disabled={!target}
        onClick={() => target && go(target.id)}
        aria-label={target ? t(direction === 'previous' ? 'destination.previousSection' : 'destination.nextSection', { name: target.label }) : undefined}
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full text-starlight transition-colors hover:bg-world hover:text-void disabled:pointer-events-none disabled:opacity-30',
          extra,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </button>
    )
  }

  return (
    <nav aria-label={label} className={className}>
      {/* From md: vertical rail on the right edge. */}
      <div className="fixed top-1/2 right-2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 md:flex lg:right-5">
        {stepButton(previous, 'previous', 'glass')}
        <div className="relative py-1">
          <div aria-hidden="true" className="absolute top-6 bottom-6 left-1/2 w-px -translate-x-1/2 bg-moon-dust/20">
            <div
              className="h-full w-full origin-top bg-world transition-transform duration-500"
              style={{ transform: `scaleY(${items.length > 1 ? activeIndex / (items.length - 1) : 1})` }}
            />
          </div>
          <ol className="relative flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => onAnchor(event, item.id)}
                  aria-current={item.id === active ? 'location' : undefined}
                  className="group relative flex size-11 items-center justify-center rounded-full"
                >
                  <span className="block size-2.5 rounded-full border border-moon-dust/70 bg-void transition-all group-hover:border-world group-aria-[current=location]:size-4 group-aria-[current=location]:border-world group-aria-[current=location]:bg-world group-aria-[current=location]:shadow-[0_0_14px_var(--world-accent)]" />
                  <span
                    aria-hidden="true"
                    className="glass pointer-events-none absolute right-full mr-2 hidden max-w-56 truncate rounded-full px-3 py-1 font-mono text-[0.62rem] tracking-widest whitespace-nowrap text-starlight uppercase group-hover:block group-hover:max-w-none group-focus-visible:block group-focus-visible:max-w-none min-[1680px]:group-aria-[current=location]:block"
                  >
                    {item.label}
                  </span>
                  <span className="sr-only">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
        {stepButton(next, 'next', 'glass')}
      </div>

      {/* Phones: floating pill at the bottom right. */}
      <div className="glass fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 flex items-center rounded-full p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] md:hidden">
        {stepButton(previous, 'previous')}
        <span aria-hidden="true" className="max-w-[9.5rem] truncate px-1 font-mono text-[0.65rem] tracking-wider text-starlight uppercase">
          {items[activeIndex]?.label}
        </span>
        {stepButton(next, 'next')}
      </div>
    </nav>
  )
}
