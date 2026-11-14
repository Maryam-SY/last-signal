import { BookMarked } from 'lucide-react'
import type { Source } from '@/api/types'
import { cn } from '@/lib/utils'
import { SourceList } from './SourceList'

interface SourcesDisclosureProps {
  sources: Source[]
  /** Accessible name of the region and visible summary, e.g. "Sources of this mission (3)". */
  label: string
  className?: string
}

/**
 * SOURCE-002 without cluttering the story (US-5.11): the sources of a mission or a machine stay
 * one click away, folded under a discreet "Sources (n)" line, and are all listed on About.
 */
export function SourcesDisclosure({ sources, label, className }: SourcesDisclosureProps) {
  if (sources.length === 0) return null
  return (
    <section aria-label={label} className={className}>
      <details className="group rounded-2xl border border-white/8 bg-void/30 px-4">
        <summary
          className={cn(
            'flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-moon-dust transition-colors hover:text-starlight',
            '[&::-webkit-details-marker]:hidden',
          )}
        >
          <BookMarked aria-hidden="true" className="size-4 text-world" />
          {label}
          <span aria-hidden="true" className="ml-auto text-xs transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="pt-1 pb-4">
          <SourceList sources={sources} />
        </div>
      </details>
    </section>
  )
}
