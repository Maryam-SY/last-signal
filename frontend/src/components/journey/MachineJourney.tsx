import { useEffect, useRef, useState } from 'react'
import { Box } from 'lucide-react'
import type { Machine, MissionDetail, StorySummary } from '@/api/types'
import { MachineCard } from '@/components/gallery/MachineCard'
import { MediaFigure } from '@/components/media/MediaFigure'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { formatPartialDate } from '@/lib/formatDate'
import { machineChapters, machineCover, modelOf, type JourneyChapter, type Told } from '@/lib/journey'
import { cn } from '@/lib/utils'
import { MachineStage } from './MachineStage'
import { ModelViewer3D } from './ModelViewer3D'
import { useSceneMotion } from './useSceneMotion'

interface MachineJourneyProps {
  machine: Machine
  /** Photos and timeline of the mission; null while they load (or if they cannot be loaded). */
  mission: MissionDetail | null
  story: StorySummary | null
  /** What the mission log above already tells (US-5.9): not repeated in this scene. */
  told?: Told
}

/**
 * One machine as a scroll scene (scrollytelling): a sticky stage shows the machine in 3D while
 * the text scrolls next to it — first its summary card, then what it did, step by step, each
 * step bringing its own picture onto the stage. The text stays in reading order for screen
 * readers; under reduced motion each picture is simply shown inside its step.
 */
export function MachineJourney({ machine, mission, story, told }: MachineJourneyProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const sceneRef = useSceneMotion<HTMLElement>(!reduced)
  // The machine's own photo on the stage (#16 rules), avoiding pictures the mission log above
  // has already told; the API cover when the mission has no picture of this machine.
  const cover = (mission ? machineCover(mission, machine.id, told?.mediaIds) : undefined) ?? machine.cover ?? undefined
  const chapters = mission ? machineChapters(machine, mission, cover, 4, told) : []
  const model = mission ? modelOf(mission, machine.id) : undefined
  const [showModel, setShowModel] = useState(false)
  // The 3D model takes the sticky stage only on large screens. On phones the stage is too
  // short for it: the model goes in the flow under the card and the sticky stage steps aside
  // (each chapter then shows its own picture), so nothing covers the model.
  const wide = useMediaQuery('(min-width: 1024px)')
  const modelInFlow = showModel && model !== undefined && !wide
  // Same tree with or without the mission data, so the card (and its focus) is never remounted.
  const staged = !reduced && cover !== undefined && !modelInFlow
  const [active, setActive] = useState(0)
  const chapterRefs = useRef<(HTMLLIElement | null)[]>([])

  // The chapter crossing the middle of the screen decides which picture is on stage.
  useEffect(() => {
    if (!staged || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.chapter))
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    for (const element of chapterRefs.current) if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [staged, chapters.length])

  const stageMedia = active === 0 ? cover : (chapters[active - 1]?.media ?? cover)

  return (
    <section ref={sceneRef} aria-label={machine.name} className="machine-journey relative">
      <div className={cn('grid gap-6', staged && 'lg:grid-cols-[1.1fr_0.9fr] lg:gap-12')}>
        {staged && (
          <div className="sticky top-16 z-10 h-[44vh] bg-void/70 py-2 backdrop-blur-sm lg:top-24 lg:h-[calc(100vh-8rem)] lg:bg-transparent lg:backdrop-blur-none">
            {showModel && model && wide ? <ModelViewer3D model={model} /> : <MachineStage media={stageMedia} />}
          </div>
        )}

        <ol className="relative">
          <li
            ref={(element) => {
              chapterRefs.current[0] = element
            }}
            data-chapter={0}
            className={cn('flex flex-col justify-center', staged && 'min-h-[85vh] max-lg:justify-end max-lg:pb-10')}
          >
            {!staged && !modelInFlow && cover && <MediaFigure media={cover} className="mb-4" />}
            <MachineCard machine={machine} story={story} showCover={false} />
            {model && (
              <button
                type="button"
                aria-pressed={showModel}
                onClick={() => setShowModel((value) => !value)}
                className="mt-3 inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-stellar-cyan/60 px-4 text-sm font-medium hover:bg-nebula-surface"
              >
                <Box aria-hidden="true" className="size-4" />
                {showModel ? t('journey.hideModel') : t('journey.showModel')}
              </button>
            )}
            {showModel && model && (!staged || modelInFlow) && (
              <div className="mt-4 h-[26rem]">
                <ModelViewer3D model={model} />
              </div>
            )}
          </li>
          {chapters.map((chapter, index) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              index={index + 1}
              staged={staged}
              register={(element) => {
                chapterRefs.current[index + 1] = element
              }}
            />
          ))}
        </ol>
      </div>
    </section>
  )
}

interface ChapterItemProps {
  chapter: JourneyChapter
  index: number
  staged: boolean
  register: (element: HTMLLIElement | null) => void
}

function ChapterItem({ chapter, index, staged, register }: ChapterItemProps) {
  const { t, locale } = useTranslation()
  return (
    <li ref={register} data-chapter={index} className={cn('flex flex-col justify-center', staged ? 'min-h-[75vh] max-lg:justify-end max-lg:pb-10' : 'mt-8')}>
      <article className="rounded-xl border border-stellar-border/50 bg-deep-space/85 p-5 backdrop-blur-sm">
        <p className="font-mono text-xs uppercase tracking-widest text-stellar-cyan">
          {chapter.date ? (
            <time dateTime={chapter.date.value}>{formatPartialDate(chapter.date.value, locale)}</time>
          ) : (
            t('journey.anotherLook')
          )}
        </p>
        {chapter.title && <h5 className="mt-1 font-heading text-xl font-bold">{chapter.title}</h5>}
        <p className="mt-2 leading-relaxed text-starlight/90">{chapter.text}</p>
        {!staged && <MediaFigure media={chapter.media} className="mt-4" />}
      </article>
    </li>
  )
}
