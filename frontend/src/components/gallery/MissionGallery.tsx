import { useEffect, useId, useState } from 'react'
import { BookOpenText } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { api } from '@/api/client'
import type { DestinationDetail } from '@/api/types'
import { paths } from '@/app/paths'
import { LoadState } from '@/components/common/LoadState'
import { useApi } from '@/hooks/useApi'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import type { DestinationId } from '@/types/content'
import { MachineJourney } from '@/components/journey/MachineJourney'
import { MissionScene } from '@/components/journey/MissionScene'
import { bestStill } from '@/lib/journey'
import { MissionTimeline } from './MissionTimeline'

/**
 * EQUIP-001 / EQUIP-006: the destination's machines grouped by mission, with a jump bar.
 * This gallery works on its own, without the map (SYNC-003).
 */
export function MissionGallery({ destinationId }: { destinationId: DestinationId }) {
  const { t } = useTranslation()
  const destination = useApi(`destination:${destinationId}`, (lang, signal) => api.destination(destinationId, lang, signal))

  return (
    <section aria-labelledby="missions-title" className="mx-auto max-w-5xl px-5 pb-24">
      <h2 id="missions-title" className="font-heading text-3xl font-bold sm:text-4xl">
        {t('destination.missionsTitle')}
      </h2>
      {destination.status !== 'success' ? (
        <div className="mt-4">
          <LoadState status={destination.status} onRetry={destination.retry} />
        </div>
      ) : (
        <GalleryContent destination={destination.data} />
      )}
    </section>
  )
}

function GalleryContent({ destination }: { destination: DestinationDetail }) {
  const { t } = useTranslation()
  const { hash } = useLocation()

  // The anchor (#mission-…, #machine-… from "Exit story") only exists once the data has
  // arrived, so the browser cannot jump to it by itself: do it now, then focus the target.
  useEffect(() => {
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    if (!target) return
    target.scrollIntoView({ block: 'start' })
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }, [hash])

  return (
    <>
      <p className="mt-2 text-moon-dust">{destination.intro}</p>
      <p className="mt-1 font-mono text-xs uppercase tracking-widest text-moon-dust">
        {t('destination.missionsCount', { missions: destination.missionCount, machines: destination.machineCount })}
      </p>

      <nav aria-label={t('destination.jumpToMission')} className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {destination.missions.map((mission) => (
            <li key={mission.id}>
              <a
                href={`#mission-${mission.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-stellar-cyan/50 px-4 text-sm font-medium hover:bg-nebula-surface"
              >
                {mission.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-16">
        {destination.missions.map((mission) => (
          <MissionSection key={mission.id} mission={mission} />
        ))}
      </div>
    </>
  )
}

function MissionSection({ mission }: { mission: DestinationDetail['missions'][number] }) {
  const { t, locale } = useTranslation()
  const [timelineOpen, setTimelineOpen] = useState(false)
  const timelineId = useId()
  const titleId = `mission-${mission.id}-title`
  const period = mission.period?.value
  // Photos and timeline of the mission feed the scroll journey; until they arrive (or if they
  // cannot be loaded) the machines are shown as plain cards, so the gallery always works.
  const detail = useApi(`mission:${mission.id}`, (lang, signal) => api.mission(mission.id, lang, signal))
  const cover = detail.status === 'success' ? bestStill(detail.data.media) : undefined

  return (
    <section id={`mission-${mission.id}`} aria-labelledby={titleId} className="scroll-mt-24">
      <MissionScene cover={cover}>
      <h3 id={titleId} tabIndex={-1} className="font-heading text-2xl font-bold sm:text-3xl">
        {mission.name}
      </h3>
      {period && (
        <p className="mt-1 font-mono text-sm text-stellar-cyan">
          {period.end
            ? t('destination.period', { start: formatPartialDate(period.start, locale), end: formatPartialDate(period.end, locale) })
            : t('destination.since', { start: formatPartialDate(period.start, locale) })}
        </p>
      )}
      <p className="mt-3 max-w-3xl text-moon-dust">{mission.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {mission.mainStory && (
          <Link
            to={paths.story(mission.mainStory.id)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/85"
          >
            <BookOpenText aria-hidden="true" className="size-4" />
            {t('destination.readStory', { title: mission.mainStory.title })}
          </Link>
        )}
        <button
          type="button"
          aria-expanded={timelineOpen}
          aria-controls={timelineId}
          onClick={() => setTimelineOpen((v) => !v)}
          className="inline-flex min-h-11 items-center rounded-md border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface"
        >
          {timelineOpen ? t('destination.timelineHide') : t('destination.timelineShow')}
        </button>
      </div>

      </MissionScene>

      <div id={timelineId} hidden={!timelineOpen} className="mt-6">
        {timelineOpen && <MissionTimeline missionId={mission.id} />}
      </div>

      <h4 className="sr-only">{t('destination.machinesTitle')}</h4>
      <div className="mt-10 space-y-24">
        {mission.machines.map((machine) => (
          <MachineJourney
            key={machine.id}
            machine={machine}
            mission={detail.status === 'success' ? detail.data : null}
            story={mission.mainStory}
          />
        ))}
      </div>
    </section>
  )
}
