import { LoadState } from '@/components/feedback/LoadState'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { api } from '@/lib/api'
import { formatPartialDate } from '@/lib/format'
import type { Source } from '@/types/content'

const linkClass = 'font-medium text-cosmic-indigo hover:underline'

/** Credits, AI usage and the full list of sources (ABOUT-001, SOURCE-004). Licences of fonts and libraries: US-5.1. */
export function AboutPage() {
  const { t, locale } = useTranslation()
  useDocumentTitle(t('about.title'))
  const sources = useApiResource(`sources:${locale}`, (signal) => api.sources(locale, signal))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{t('about.title')}</h1>
      <p className="mt-4 font-medium">{t('app.disclaimer')}</p>

      <section aria-labelledby="about-credits" className="mt-8">
        <h2 id="about-credits" className="text-xl font-semibold">
          {t('about.creditsTitle')}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('about.imagesCredit')}{' '}
          <a href="https://nssdc.gsfc.nasa.gov/Images/" target="_blank" rel="noreferrer" className={linkClass}>
            {t('about.imagesSourceLabel')}
            {' '}<span className="sr-only">{t('common.opensInNewTab')}</span>
          </a>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{t('about.mediaCredit')}</p>
      </section>

      <section aria-labelledby="about-ai" className="mt-8">
        <h2 id="about-ai" className="text-xl font-semibold">
          {t('about.aiTitle')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('about.aiText')}</p>
      </section>

      <section aria-labelledby="about-sources" className="mt-8">
        <h2 id="about-sources" className="text-xl font-semibold">
          {t('about.sourcesTitle')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('about.sourcesIntro')}</p>
        {sources.status === 'success' ? (
          <SourceList sources={sources.data} />
        ) : (
          <LoadState status={sources.status === 'loading' ? 'loading' : 'error'} onRetry={sources.retry} className="mt-2" />
        )}
      </section>
    </div>
  )
}

function SourceList({ sources }: { sources: readonly Source[] }) {
  const { t, locale } = useTranslation()
  return (
    <ol className="mt-4 space-y-4 text-sm">
      {sources.map((source) => (
        <li key={source.id} id={`source-${source.id}`} className="scroll-mt-24">
          <p className="text-muted-foreground">{source.organization}</p>
          <a href={source.url} target="_blank" rel="noreferrer" className={linkClass}>
            {source.title}
            {' '}<span className="sr-only">{t('common.opensInNewTab')}</span>
          </a>
          <p className="text-xs text-muted-foreground">
            {t('sources.accessedOn', { date: formatPartialDate(source.accessedOn, locale) })}
          </p>
        </li>
      ))}
    </ol>
  )
}
