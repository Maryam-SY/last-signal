import { ExternalLink } from 'lucide-react'
import type { Source } from '@/api/types'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'

/** SOURCE-002/003: organisation, title, external link and consultation date for each source. */
export function SourceList({ sources }: { sources: Source[] }) {
  const { t, locale } = useTranslation()
  if (sources.length === 0) return null

  return (
    <ul className="space-y-2 text-sm">
      {sources.map((source) => (
        <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 font-medium text-cosmic-indigo hover:underline"
          >
            {source.title}
            <ExternalLink aria-hidden="true" className="mt-1 size-3 shrink-0" />
            <span className="sr-only">{t('media.newTab')}</span>
          </a>
          <span className="block text-xs text-moon-dust">
            {source.organization}
            {source.publishedOn && ` · ${t('sources.publishedOn', { date: formatPartialDate(source.publishedOn, locale) })}`}
            {` · ${t('sources.accessedOn', { date: formatPartialDate(source.accessedOn, locale) })}`}
          </span>
          {source.note && <span className="block text-xs text-moon-dust/80">{source.note}</span>}
        </li>
      ))}
    </ul>
  )
}
