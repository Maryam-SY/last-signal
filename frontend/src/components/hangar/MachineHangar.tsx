import type { DestinationDetail } from '@/api/types'
import { StatusHelp } from '@/components/machine/StatusHelp'
import { Reveal } from '@/components/motion/Reveal'
import { useTranslation } from '@/i18n'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { MachinePortal } from './MachinePortal'

/**
 * The hangar of a world (US-5.12): every machine left there, side by side, to choose from —
 * like the planets on the home page. Each one opens its own page with its whole life.
 */
export function MachineHangar({ destination }: { destination: DestinationDetail }) {
  const { t } = useTranslation()
  const machines = destination.missions.flatMap((mission) => mission.machines.map((machine) => ({ machine, mission })))

  return (
    <section id="hangar" aria-labelledby="hangar-title" className="scene-blend mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <Reveal>
        <p className={cn(eyebrow, 'text-world')}>{t('hangar.eyebrow')}</p>
        <h2 id="hangar-title" tabIndex={-1} className="mt-2 font-heading text-4xl font-bold outline-none sm:text-6xl">
          {t('hangar.title')}
        </h2>
        <p className="mt-3 max-w-2xl text-moon-dust sm:text-lg">{t('hangar.intro')}</p>
        <StatusHelp className="mt-6 max-w-2xl" />
      </Reveal>
      <ul className="machine-hangar mt-10 grid gap-5 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
        {machines.map(({ machine, mission }, index) => (
          <li key={machine.id}>
            <MachinePortal machine={machine} missionName={mission.name} destinationId={destination.id} index={index} count={machines.length} />
          </li>
        ))}
      </ul>
    </section>
  )
}
