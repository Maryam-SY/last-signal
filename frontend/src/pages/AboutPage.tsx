import { api } from '@/api/client'
import { LoadState } from '@/components/common/LoadState'
import { SourceList } from '@/components/sources/SourceList'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation, type MessageKey } from '@/i18n'

const SECTIONS: { id: string; titleKey: MessageKey }[] = [
  { id: 'credits', titleKey: 'about.creditsTitle' },
  { id: 'ai', titleKey: 'about.aiTitle' },
  { id: 'sources', titleKey: 'about.sourcesTitle' },
]

/** Shell only — full content arrives with US-5.1 (ABOUT-001). */
export function AboutPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('about.title'))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{t('about.title')}</h1>
      <p className="mt-4 font-medium">{t('app.disclaimer')}</p>
      {SECTIONS.map(({ id, titleKey }) => (
        <section key={id} aria-labelledby={`about-${id}`} className="mt-8">
          <h2 id={`about-${id}`} className="text-xl font-semibold">
            {t(titleKey)}
          </h2>
          {id === 'sources' ? <AllSources /> : <p className="mt-2 text-muted-foreground">{t('about.comingSoon')}</p>}
          {id === 'credits' && (
            <p className="mt-3 text-sm text-muted-foreground">
              {t('about.imagesCredit')}{' '}
              <a
                href="https://nssdc.gsfc.nasa.gov/Images/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-cosmic-indigo hover:underline"
              >
                {t('about.imagesSourceLabel')}
              </a>
            </p>
          )}
        </section>
      ))}
    </div>
  )
}

/** SOURCE-004: every source used on the site, each with its own #source-{id} anchor. */
function AllSources() {
  const { t } = useTranslation()
  const sources = useApi('sources', (lang, signal) => api.sources(lang, signal))
  if (sources.status !== 'success') return <LoadState status={sources.status} onRetry={sources.retry} />
  return (
    <>
      <p className="mt-2 mb-4 text-muted-foreground">{t('about.sourcesIntro')}</p>
      <SourceList sources={sources.data} />
    </>
  )
}
