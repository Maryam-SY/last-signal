import { useState } from 'react'
import { Box } from 'lucide-react'
import type { Machine, MissionDetail, StorySummary } from '@/api/types'
import { MachineCard } from '@/components/gallery/MachineCard'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { machineChapters, machineCover, modelOf, type Told } from '@/lib/journey'
import { ModelViewer3D } from './ModelViewer3D'
import { PhotoFlight } from './PhotoFlight'

interface MachineJourneyProps {
  machine: Machine
  /** Photos and timeline of the mission; null while they load (or if they cannot be loaded). */
  mission: MissionDetail | null
  story: StorySummary | null
  /** What the mission log above already tells (US-5.9): not repeated in this scene. */
  told?: Told
}

/**
 * One machine as a scroll scene: its card (photo, what it did, what became of it, what it
 * passed on), its NASA 3D model on request, then — when it has more pictures with a story —
 * a flight down a corridor of those pictures (PhotoFlight, US-5.11). Reading order is kept for
 * screen readers; under reduced motion the pictures are a plain list.
 */
export function MachineJourney({ machine, mission, story, told }: MachineJourneyProps) {
  const { t, locale } = useTranslation()
  // The machine's own photo (#16 rules), avoiding pictures the mission log above has already
  // told; the API cover when the mission has no picture of this machine.
  const cover = (mission ? machineCover(mission, machine.id, told?.mediaIds) : undefined) ?? machine.cover ?? undefined
  const chapters = mission ? machineChapters(machine, mission, cover, 4, told) : []
  const model = mission ? modelOf(mission, machine.id) : undefined
  const [showModel, setShowModel] = useState(false)

  return (
    <section aria-label={machine.name} className="machine-journey relative">
      <MachineCard machine={machine} story={story} cover={cover} />
      {model && (
        <button
          type="button"
          aria-pressed={showModel}
          onClick={() => setShowModel((value) => !value)}
          className="mt-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-stellar-cyan/60 px-4 text-sm font-medium transition-colors hover:bg-nebula-surface"
        >
          <Box aria-hidden="true" className="size-4" />
          {showModel ? t('journey.hideModel') : t('journey.showModel')}
        </button>
      )}
      {showModel && model && (
        <div className="mt-4 h-[26rem] lg:h-[34rem]">
          <ModelViewer3D model={model} />
        </div>
      )}

      <PhotoFlight
        label={t('journey.flightLabel', { name: machine.name })}
        className="mt-10"
        items={chapters.map((chapter) => ({
          id: chapter.id,
          media: chapter.media,
          // A chapter's text is often the picture's own story: do not print it twice.
          withStory: chapter.text !== chapter.media.description,
          content: (
            <>
              <p className="font-mono text-xs tracking-widest text-world uppercase">
                {chapter.date ? (
                  <time dateTime={chapter.date.value}>{formatPartialDate(chapter.date.value, locale)}</time>
                ) : (
                  t('journey.anotherLook')
                )}
              </p>
              {chapter.title && <h5 className="mt-1 font-heading text-2xl leading-tight font-bold sm:text-3xl">{chapter.title}</h5>}
              <p className="mt-2 text-[0.95rem] leading-relaxed text-starlight/90 sm:text-lg">{chapter.text}</p>
            </>
          ),
        }))}
      />
    </section>
  )
}
