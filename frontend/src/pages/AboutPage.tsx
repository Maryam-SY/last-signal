import { BookMarked, Cpu, Images } from 'lucide-react'
import { api } from '@/api/client'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { LoadState } from '@/components/common/LoadState'
import { Reveal } from '@/components/motion/Reveal'
import { MediaCredits } from '@/components/sources/MediaCredits'
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

/** ABOUT-001: credits of every picture (US-5.11), use of AI (US-5.1) and every source (SOURCE-004). */
export function AboutPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('about.title'))

  return (
    <div className="relative">
      <SpaceBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-5 pt-16 pb-24 sm:pt-24">
        <p className={cn(eyebrow, 'text-cosmic-cyan')}>{t('about.eyebrow')}</p>
        <h1 className="text-glow mt-3 font-heading text-5xl font-bold sm:text-7xl">{t('about.title')}</h1>
        <p className="mt-6 max-w-2xl text-lg font-medium">{t('app.disclaimer')}</p>

        <div className="mt-14 space-y-6">
          <nav aria-label={t('about.toc')} className="reading-panel rounded-2xl p-4 sm:p-5">
            <p className="font-mono text-[0.72rem] tracking-[0.3em] text-world uppercase">{t('about.toc')}</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {SECTIONS.map(({ id, titleKey }) => (
                <li key={id}>
                  <a href={`#about-${id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-starlight hover:text-world">
                    {t(titleKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {SECTIONS.map(({ id, titleKey, Icon }, index) => (
            <Reveal key={id} delay={index * 80}>
              <section id={`about-${id}`} aria-labelledby={`about-${id}-title`} className="scene-blend reading-panel min-w-0 scroll-mt-24 rounded-2xl p-6 [overflow-wrap:anywhere] sm:p-8">
                <h2 id={`about-${id}-title`} className="flex items-center gap-3 font-heading text-2xl font-bold">
                  <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full border border-cosmic-cyan/40 text-cosmic-cyan">
                    <Icon className="size-5" />
                  </span>
                  {t(titleKey)}
                </h2>
                {id === 'sources' ? <AllSources /> : id === 'credits' ? <MediaCredits /> : <p className="mt-3 leading-relaxed text-starlight/90">{t('about.aiText')}</p>}
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
