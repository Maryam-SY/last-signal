import type { ReactNode } from 'react'
import { SourceBadge } from '@/components/sources/SourceBadge'
import { cn } from '@/lib/utils'
import type { Source, Sourced } from '@/types/content'

interface FactRowProps {
  label: string
  fact: Sourced<unknown>
  sources: ReadonlyMap<string, Source>
  children: ReactNode
  mono?: boolean
}

/** One sourced fact in a definition list: value, optional note, access to its sources. */
export function FactRow({ label, fact, sources, children, mono = false }: FactRowProps) {
  return (
    <div className="border-t border-stellar-border/50 py-3 first:border-t-0">
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-moon-dust">{label}</dt>
      <dd className="mt-1">
        <div className={cn('text-starlight', mono && 'font-mono text-sm')}>{children}</div>
        {fact.note && <p className="mt-1 text-xs text-moon-dust">{fact.note}</p>}
        <SourceBadge sourceIds={fact.sourceIds} sources={sources} />
      </dd>
    </div>
  )
}
