import { useRef } from 'react'
import { HudCorners } from '@/components/common/HudCorners'
import { CountUp } from '@/components/motion/CountUp'
import { useInView } from '@/hooks/useInView'
import { useTranslation, type MessageKey } from '@/i18n'
import { roman, type Act } from '@/lib/acts'
import { formatPartialDate } from '@/lib/formatDate'
import { splitDuration } from '@/lib/lifespan'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import type { DestinationId } from '@/types/content'

interface ActCardProps {
  act: Act
  number: number
  /** id of the title, for the section's aria-labelledby. */
  titleId: string
  destinationId: DestinationId
  /** The machine's name, for the "still working" act. */
  machineName: string
}

/** Days → "{years} ans et {months} mois" or "{days} jours", with the machine page's own keys. */
function durationText(days: number, t: (key: MessageKey, vars?: Record<string, string | number>) => string): string {
  const span = splitDuration(days)
  return span.years > 0 ? t('machine.durationYears', { years: span.years, months: span.months }) : t('machine.durationDays', { days })
}

/**
 * The title card of one act of a machine's life (US-5.14): a full-screen beat between two
 * flights of pictures — its number, its name, the dates it spans and the one figure that
 * makes it what it is (the plan, the ratio, the length of the silence). Each act sets its own
 * tone (`data-tone`) for the page around it. Figures are only arithmetic on sourced dates.
 */
export function ActCard({ act, number, titleId, destinationId, machineName }: ActCardProps) {
  const { t, locale } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref, '0px 0px -30% 0px')
  const title = act.key === 'alive' ? t('acts.alive.title', { name: machineName }) : t(`acts.${act.key}.title`)
  const range = act.from && act.to && act.from !== act.to ? `${formatPartialDate(act.from, locale)} → ${formatPartialDate(act.to, locale)}` : act.from ? formatPartialDate(act.from, locale) : null

  let subtitle: string | null = null
  let figure: { value: number; prefix?: string; label: string } | null = null
  switch (act.key) {
    case 'departure':
      subtitle = t('acts.departure.sub', { world: t(`destinations.${destinationId}.name`) })
      break
    case 'planned':
      if (act.planned) {
        const unit = act.planned.unit === 'years' && act.planned.amount === 1 ? 'machine.unit.year' : (`machine.unit.${act.planned.unit}` as MessageKey)
        subtitle = t('acts.planned.sub', { duration: t(unit, { amount: act.planned.amount }) })
      }
      break
    case 'beyond':
      if (act.plannedDays) subtitle = t('acts.beyond.sub', { day: Math.round(act.plannedDays) + 1 })
      if (act.ratio) figure = { value: Math.round(act.ratio), prefix: '×', label: t('machine.beyond') }
      break
    case 'silence':
      // The figure counts the days; the sentence below says it in years and months when long.
      if (act.silentDays) {
        figure = { value: act.silentDays, label: t('acts.silence.days') }
        if (act.silentDays >= 365) subtitle = t('acts.silence.sub', { duration: durationText(act.silentDays, t) })
      }
      break
    case 'after':
      subtitle = t('acts.after.sub')
      break
    case 'alive':
      if (act.since) subtitle = t('acts.alive.sub', { year: act.since })
      break
    case 'life':
      subtitle = t('acts.life.sub')
      break
  }

  return (
    <div ref={ref} data-tone={act.key} className={cn('act-card relative mx-auto flex min-h-[78dvh] max-w-5xl flex-col items-center justify-center px-5 py-24 text-center', live && 'is-live')}>
      <span aria-hidden="true" className="act-numeral text-outline pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[clamp(10rem,36vw,26rem)] leading-none font-bold select-none">
        {roman(number)}
      </span>
      <div className="act-body relative w-full max-w-3xl rounded-[2rem] px-6 py-10 sm:px-12 sm:py-14">
        <HudCorners />
        <p className={cn(eyebrow, 'act-eyebrow text-world')}>
          {t('acts.act', { numeral: roman(number) })}
          {range && <span className="text-moon-dust"> · {range}</span>}
        </p>
        <h2 id={titleId} data-narrate className="act-title mt-4 font-heading text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] font-bold tracking-tight">
          {title}
        </h2>
        {figure && (
          <p data-narrate data-narrate-text={`${figure.prefix ?? ''}${figure.value} ${figure.label}.`} className="act-figure mt-6 font-heading text-[clamp(3rem,10vw,7rem)] leading-none font-bold">
            <span className="stat-number">
              {figure.prefix}
              <CountUp value={figure.value} run={live} duration={1800} />
            </span>
            <span className="mt-2 block font-sans text-base font-medium text-starlight/85 sm:text-xl">{figure.label}</span>
          </p>
        )}
        {subtitle && (
          <p data-narrate className="act-sub text-legible mt-6 text-lg leading-relaxed text-starlight/90 sm:text-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
