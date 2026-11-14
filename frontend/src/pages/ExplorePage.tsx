import { Link } from 'react-router'
import { ArrowRight, ChevronsDown } from 'lucide-react'
import { paths } from '@/app/paths'
import { Planet } from '@/components/celestial/Planet'
import { Starfield } from '@/components/celestial/Starfield'
import { Reveal } from '@/components/motion/Reveal'
import { buttonVariants } from '@/components/ui/button'
import { CELESTIAL_BODIES, getBody, type CelestialBody } from '@/content/celestialBodies'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

export function ExplorePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('explore.title'))

  return (
    <div className="relative overflow-hidden">
      <Starfield />
      <div className="relative z-10">
        <Hero />
        <div>
          {CELESTIAL_BODIES.map((body, index) => (
            <BodySection key={body.id} body={body} index={index} />
          ))}
        </div>
        <Outro />
      </div>
      <BodyIndex />
    </div>
  )
}

function Hero() {
  const { t } = useTranslation()
  const heroPlanet = getBody('saturn')

  return (
    <section className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-5 pt-20 pb-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-stellar-cyan">
            {t('explore.eyebrow')}
          </p>
          <h1 className="mt-5 font-heading text-5xl leading-[0.95] font-bold sm:text-7xl">
            {t('explore.title')}
          </h1>
          <p className="mt-6 max-w-xl text-base text-moon-dust sm:text-lg">{t('explore.intro')}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to={paths.destination('moon')}
              className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6')}
            >
              {t('destinations.moon.cta')}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to={paths.destination('mars')}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-6')}
            >
              {t('destinations.mars.cta')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[32rem]">
          <div
            aria-hidden="true"
            className="absolute inset-[14%] rounded-full border border-stellar-cyan/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-[6%] rounded-full border border-cosmic-indigo/10"
          />
          <Planet body={heroPlanet} className="relative" />
        </div>
      </div>

      <div className="mt-14 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-moon-dust/70">
        <ChevronsDown className="size-4 animate-bounce motion-reduce:animate-none" />
        {t('explore.scrollHint')}
      </div>
    </section>
  )
}

function BodySection({ body, index }: { body: CelestialBody; index: number }) {
  const { t } = useTranslation()
  const titleId = `body-${body.id}-title`
  const reversed = index % 2 === 1

  return (
    <section
      id={body.id}
      aria-labelledby={titleId}
      className="relative scroll-mt-24 border-t border-stellar-border/40"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div className={cn('order-2', reversed ? 'lg:order-2' : 'lg:order-1')}>
          <Reveal>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-stellar-cyan">
              {t(`bodies.${body.id}.kind`)}
            </p>
            <h2
              id={titleId}
              className="mt-4 font-heading text-4xl leading-tight font-bold sm:text-6xl"
            >
              {t(`bodies.${body.id}.name`)}
            </h2>
            <p className="mt-5 max-w-lg text-moon-dust">{t(`bodies.${body.id}.description`)}</p>
            {body.destinationId && (
              <Link
                to={paths.destination(body.destinationId)}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'mt-8 h-11 px-6',
                )}
              >
                {t('explore.openDestination')}
                <ArrowRight className="size-4" />
              </Link>
            )}
          </Reveal>
        </div>

        <div
          className={cn(
            'mx-auto w-full max-w-[26rem]',
            reversed ? 'order-1 lg:order-1' : 'order-1 lg:order-2',
          )}
        >
          <Reveal delay={120}>
            <Planet body={body} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Outro() {
  const { t } = useTranslation()

  return (
    <section className="relative border-t border-stellar-border/40">
      <div className="mx-auto max-w-3xl px-5 py-28 text-center">
        <Reveal>
          <h2 className="font-heading text-3xl font-bold sm:text-5xl">{t('explore.outroTitle')}</h2>
          <p className="mx-auto mt-5 max-w-xl text-moon-dust">{t('explore.outroBody')}</p>
          <Link
            to={paths.destination('moon')}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-8 h-11 px-6')}
          >
            {t('destinations.moon.cta')}
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function BodyIndex() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('explore.indexLabel')}
      className="fixed top-1/2 right-3 z-20 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col items-end gap-2">
        {CELESTIAL_BODIES.map((body) => (
          <li key={body.id}>
            <a href={`#${body.id}`} className="group flex items-center justify-end gap-2">
              <span className="rounded bg-void/80 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-moon-dust opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {t(`bodies.${body.id}.name`)}
              </span>
              <span className="block size-1.5 rounded-full bg-moon-dust/40 transition-colors group-hover:bg-stellar-cyan group-focus-visible:bg-stellar-cyan" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
