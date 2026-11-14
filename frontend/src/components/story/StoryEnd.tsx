import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { Reveal } from '@/components/motion/Reveal'
import { useTranslation } from '@/i18n'
import { ctaGhost, ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { DESTINATION_IDS, type DestinationId } from '@/types/content'

/** Six stars, one per step, joined into a small constellation (decoration). */
const STARS = [
  [20, 70],
  [55, 30],
  [95, 52],
  [135, 18],
  [170, 60],
  [205, 34],
] as const

/** STORY-008: the end of the journey — back to the machines, or on to the other world. */
export function StoryEnd({ destinationId, exitHref }: { destinationId: DestinationId | null; exitHref: string }) {
  const { t } = useTranslation()
  const other = DESTINATION_IDS.find((d) => d !== destinationId)

  return (
    <section aria-labelledby="story-end-title" className="flex min-h-[80dvh] flex-col items-center justify-center py-24 text-center">
      <Reveal className="flex flex-col items-center">
        <svg aria-hidden="true" viewBox="0 0 225 90" className="w-56 overflow-visible">
          <polyline
            points={STARS.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="var(--world-accent)"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          {STARS.map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index === STARS.length - 1 ? 5 : 3.5}
              fill="#f1f5f9"
              className="motion-safe:animate-pulse"
              style={{ animationDelay: `${index * 250}ms`, filter: 'drop-shadow(0 0 6px var(--world-accent))' }}
            />
          ))}
        </svg>
        <p className={cn(eyebrow, 'mt-8 text-world')}>{t('story.completeEyebrow')}</p>
        <h2 id="story-end-title" className="text-glow mt-3 font-heading text-4xl font-bold sm:text-6xl">
          {t('story.finishTitle')}
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {destinationId && (
            <Link to={exitHref} className={ctaPrimary}>
              {t('story.backToDestination', { destination: t(`destinations.${destinationId}.name`) })}
            </Link>
          )}
          {other && (
            <Link to={paths.destination(other)} className={cn(ctaGhost, 'group')}>
              {t('story.exploreOther', { destination: t(`destinations.${other}.name`) })}
              <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  )
}
