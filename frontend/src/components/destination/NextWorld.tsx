import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { LivePlanet } from '@/components/celestial/LivePlanet'
import { WORLD_TRANSITION_NAME } from '@/components/home/worldTransition'
import { ExplorerLogCard } from '@/components/progress/ExplorerLogCard'
import { getBodyByDestination } from '@/content/celestialBodies'
import { useTranslation } from '@/i18n'
import { ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import type { DestinationId } from '@/types/content'
import { WORLD_FOCUS_ATTR } from './DestinationPlanet'

/** Last scene of a destination: the other world rises, one link away (morphs into its page). */
export function NextWorld({ id }: { id: DestinationId }) {
  const { t } = useTranslation()
  const body = getBodyByDestination(id)
  const planetRef = useRef<HTMLDivElement>(null)

  // Only one element may carry the morph name: hand it over from the pinned planet.
  const takeOverMorph = () => {
    document.querySelectorAll<HTMLElement>(`[${WORLD_FOCUS_ATTR}]`).forEach((element) => {
      element.style.viewTransitionName = 'none'
    })
    if (planetRef.current) planetRef.current.style.viewTransitionName = WORLD_TRANSITION_NAME
  }

  return (
    <section
      id="next-world"
      aria-labelledby="next-world-title"
      data-world={id}
      className="relative mx-auto flex min-h-dvh max-w-5xl scroll-mt-16 flex-col items-center justify-center px-5 py-24 text-center"
    >
      <p className={cn(eyebrow, 'text-world')}>{t('destination.nextWorld')}</p>
      <h2 id="next-world-title" className="mt-3 font-heading text-4xl font-bold sm:text-6xl">
        {t('destination.nextWorldTitle')}
      </h2>
      {body && (
        <div ref={planetRef} aria-hidden="true" className="mt-10 w-[min(56vw,36vh,20rem)]">
          <LivePlanet body={body} />
        </div>
      )}
      <p className="mt-6 max-w-md text-moon-dust">{t(`bodies.${id}.description`)}</p>
      <Link to={paths.destination(id)} viewTransition onClick={takeOverMorph} className={cn(ctaPrimary, 'group mt-8')}>
        {t(`destinations.${id}.cta`)}
        <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <ExplorerLogCard className="mt-16 w-full max-w-3xl" />
    </section>
  )
}
