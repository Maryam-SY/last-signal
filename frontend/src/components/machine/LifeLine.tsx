import type { Lifespan, Sourced } from '@/api/types'
import { HudCorners } from '@/components/common/HudCorners'
import { CountUp } from '@/components/motion/CountUp'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { beyondPlan, daysBetween, lastSignal, splitDuration } from '@/lib/lifespan'
import { cn } from '@/lib/utils'

interface LifeLineProps {
  /** Arrival on its world (landing / deployment), sourced. */
  born: Sourced<string> | null
  lifespan: Lifespan | null | undefined
  /** What became of it, in plain words (status note). */
  epilogue?: string | null
  className?: string
}

/**
 * A machine's life at a glance (US-5.12): the day it arrived, the day it fell silent (or
 * "still working"), how long it was meant to live and how long it really did — drawn as a
 * heartbeat that flattens on its last signal. Only sourced dates and amounts are shown; the
 * durations are plain arithmetic on them.
 */
export function LifeLine({ born, lifespan, epilogue, className }: LifeLineProps) {
  const { t, locale } = useTranslation()
  const end = lastSignal(lifespan)
  const lived = daysBetween(born?.value, end?.value)
  const ratio = beyondPlan(lifespan, born?.value)
  const planned = lifespan?.planned?.value
  const alive = lifespan?.stillWorking?.value ?? false
  const span = lived !== null ? splitDuration(lived) : null
  const plannedText = planned
    ? t(planned.unit === 'years' && planned.amount === 1 ? 'machine.unit.year' : `machine.unit.${planned.unit}`, { amount: planned.amount })
    : null
  const realText = span
    ? span.years > 0
      ? t('machine.durationYears', { years: span.years, months: span.months })
      : t('machine.durationDays', { days: lived ?? 0 })
    : null
  // What the narration says for each figure (US-5.12 read-along): label, then value.
  const spoken = (label: string, value: string) => `${label} : ${value}.`

  return (
    <div className={cn('glass relative overflow-hidden rounded-3xl p-5 sm:p-8', className)}>
      <HudCorners />
      <svg aria-hidden="true" viewBox="0 0 600 80" preserveAspectRatio="none" className={cn('heartbeat h-16 w-full sm:h-20', alive && 'is-alive')}>
        <path
          d="M0 40 H70 L82 18 L94 62 L106 40 H180 L192 14 L204 66 L216 40 H300 L312 22 L324 58 L336 40 H420 L428 34 L436 46 L444 40 H600"
          pathLength={1}
          className="heartbeat-line"
        />
      </svg>

      <dl className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {born && (
          <div data-narrate data-narrate-text={spoken(t('machine.born'), formatPartialDate(born.value, locale))}>
            <dt className="font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{t('machine.born')}</dt>
            <dd className="mt-1 font-heading text-xl font-bold">
              <time dateTime={born.value}>{formatPartialDate(born.value, locale)}</time>
            </dd>
          </div>
        )}
        <div
          data-narrate={alive || end ? true : undefined}
          data-narrate-text={
            alive || end ? spoken(t('machine.lastSignal'), alive ? t('machine.stillWorking') : formatPartialDate(end!.value, locale)) : undefined
          }
        >
          <dt className="font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{t('machine.lastSignal')}</dt>
          <dd className="mt-1 font-heading text-xl font-bold">
            {alive ? (
              <span className="text-cosmic-cyan">{t('machine.stillWorking')}</span>
            ) : end ? (
              <time dateTime={end.value}>{formatPartialDate(end.value, locale)}</time>
            ) : (
              <span className="text-moon-dust">—</span>
            )}
          </dd>
        </div>
        {plannedText && (
          <div data-narrate data-narrate-text={spoken(t('machine.planned'), plannedText)}>
            <dt className="font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{t('machine.planned')}</dt>
            <dd className="mt-1 font-heading text-xl font-bold">{plannedText}</dd>
          </div>
        )}
        {realText && (
          <div data-narrate data-narrate-text={spoken(t('machine.real'), realText)}>
            <dt className="font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{t('machine.real')}</dt>
            <dd className="mt-1 font-heading text-xl font-bold text-world">{realText}</dd>
          </div>
        )}
      </dl>

      {ratio && (
        <p
          data-narrate
          data-narrate-text={`${t('narration.ratio', { count: Math.round(ratio) })}.`}
          className="mt-6 font-heading text-[clamp(1.6rem,4vw,2.8rem)] leading-tight font-bold"
        >
          <span className="stat-number">
            ×<CountUp value={Math.round(ratio)} />
          </span>{' '}
          <span className="text-starlight/90">{t('machine.beyond')}</span>
        </p>
      )}

      {lifespan?.achievements && lifespan.achievements.length > 0 && (
        <ul className="mt-5 space-y-2">
          {lifespan.achievements.map((achievement) => (
            <li key={achievement.value} data-narrate className="flex gap-3 text-starlight sm:text-lg">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-world" />
              {achievement.value}
            </li>
          ))}
        </ul>
      )}

      {epilogue && <p data-narrate className="mt-5 leading-relaxed text-starlight/90 sm:text-lg">{epilogue}</p>}
    </div>
  )
}
