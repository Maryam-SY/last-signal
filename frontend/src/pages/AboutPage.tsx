import { BookMarked, Cpu, Images } from 'lucide-react'
import { api } from '@/api/client'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { LoadState } from '@/components/common/LoadState'
import { Reveal } from '@/components/motion/Reveal'
import { SourceList } from '@/components/sources/SourceList'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation, type MessageKey } from '@/i18n'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

const SECTIONS: { id: string; titleKey: MessageKey; Icon: typeof Images }[] = [
  { id: 'credits', titleKey: 'about.creditsTitle', Icon: Images },
  { id: 'ai', titleKey: 'about.aiTitle', Icon: Cpu },
  { id: 'sources', titleKey: 'about.sourcesTitle', Icon: BookMarked },
]

/** Shell only — full content arrives with US-5.1 (ABOUT-001). */
export function AboutPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('about.title'))

  return (
    <div className="relative">
      <SpaceBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-5 pt-16 pb-24 sm:pt-24">
        <p className={cn(eyebrow, 'text-stellar-cyan')}>{t('about.eyebrow')}</p>
        <h1 className="text-glow mt-3 font-heading text-5xl font-bold sm:text-7xl">{t('about.title')}</h1>
        <p className="mt-6 max-w-2xl text-lg font-medium">{t('app.disclaimer')}</p>

        <div className="mt-14 space-y-6">
          {SECTIONS.map(({ id, titleKey, Icon }, index) => (
            <Reveal key={id} delay={index * 80}>
              <section id={`about-${id}`} aria-labelledby={`about-${id}-title`} className="glass scroll-mt-24 rounded-2xl p-6 sm:p-8">
                <h2 id={`about-${id}-title`} className="flex items-center gap-3 font-heading text-2xl font-bold">
                  <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full border border-stellar-cyan/40 text-stellar-cyan">
                    <Icon className="size-5" />
                  </span>
                  {t(titleKey)}
                </h2>
                {id === 'sources' ? <AllSources /> : <p className="mt-3 text-moon-dust">{t('about.comingSoon')}</p>}
                {id === 'credits' && (
                  <p className="mt-3 text-sm text-moon-dust">
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
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

/** SOURCE-004: every source used on the site, each with its own #source-{id} anchor. */
function AllSources() {
  const { t } = useTranslation()
  const sources = useApi('sources', (lang, signal) => api.sources(lang, signal))
  if (sources.status !== 'success') return <LoadState status={sources.status} onRetry={sources.retry} className="mt-4" />
  return (
    <>
      <p className="mt-3 mb-5 text-moon-dust">{t('about.sourcesIntro')}</p>
      <SourceList sources={sources.data} />
    </>
  )
}
