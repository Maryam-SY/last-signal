import { ChevronDown, ExternalLink, Link2 } from 'lucide-react'
import { useId, useState } from 'react'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Source } from '@/types/content'

interface SourceBadgeProps {
  sourceIds: readonly string[]
  sources: ReadonlyMap<string, Source>
  className?: string
}

/**
 * Shows where a fact comes from without leaving the page (SOURCE-002, US-4.4): a disclosure
 * button that reveals organisation, title, link (new tab, announced) and consultation date.
 */
export function SourceBadge({ sourceIds, sources, className }: SourceBadgeProps) {
  const { t, locale } = useTranslation()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  if (sourceIds.length === 0) return null

  const label = sourceIds.length === 1 ? t('sources.one') : t('sources.many', { count: sourceIds.length })

  return (
    <div className={cn('text-sm', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 font-mono text-xs uppercase tracking-[0.12em] text-cosmic-indigo hover:text-starlight"
      >
        <Link2 aria-hidden className="size-3.5" />
        {label}
        <ChevronDown aria-hidden className={cn('size-3.5 transition-transform motion-reduce:transition-none', open && 'rotate-180')} />
      </button>
      <section id={panelId} hidden={!open} aria-label={t('sources.panelLabel')}>
        <ul className="mt-1 space-y-2 rounded-lg border border-stellar-border/70 bg-deep-space/90 p-3">
          {sourceIds.map((id) => {
            const source = sources.get(id)
            if (!source) {
              return (
                <li key={id} className="text-moon-dust">
                  {t('sources.missing')}
                </li>
              )
            }
            return (
              <li key={id}>
                <p className="text-xs text-moon-dust">{source.organization}</p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-1 font-medium text-starlight underline decoration-stellar-border underline-offset-4 hover:decoration-cosmic-indigo"
                >
                  <span>
                    {source.title}
                    {' '}<span className="sr-only">{t('common.opensInNewTab')}</span>
                  </span>
                  <ExternalLink aria-hidden className="mt-1 size-3.5 shrink-0" />
                </a>
                <p className="mt-0.5 text-xs text-moon-dust">
                  {t('sources.accessedOn', { date: formatPartialDate(source.accessedOn, locale) })}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
