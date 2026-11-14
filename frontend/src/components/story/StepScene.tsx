import type { CSSProperties, Ref } from 'react'
import type { Media, Relation, Source, StoryBlock, StoryStep, Voice } from '@/api/types'
import { MediaFigure } from '@/components/media/MediaFigure'
import { RelationEnds } from '@/components/relations/RelationEnds'
import { Reveal } from '@/components/motion/Reveal'
import { SourceList } from '@/components/sources/SourceList'
import { VoiceTag } from '@/components/sources/VoiceTag'
import { useTranslation } from '@/i18n'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { STEP_ACCENT, stepSectionId } from './storySteps'

interface StepSceneProps {
  step: StoryStep
  number: number
  total: number
  headingRef: Ref<HTMLHeadingElement>
  mediaById: Map<string, Media>
  sourceById: Map<string, Source>
  relations: Relation[]
}

/** Accent bar of each narrative voice (STORY-007; the VoiceTag text stays the real label). */
const VOICE_BAR: Record<Voice, string> = {
  data: 'bg-stellar-gold',
  interpretation: 'bg-cosmic-indigo',
  imagination: 'bg-nebula-purple',
}

/** One step of a story as a full-screen scene of the scroll (US-5.6). */
export function StepScene({ step, number, total, headingRef, mediaById, sourceById, relations }: StepSceneProps) {
  const { t } = useTranslation()
  const titleId = `${stepSectionId(number)}-title`
  const accent = { '--scene-accent': STEP_ACCENT[step.key] } as CSSProperties

  return (
    <section
      id={stepSectionId(number)}
      aria-labelledby={titleId}
      style={accent}
      className="relative flex min-h-[calc(100dvh-4rem)] scroll-mt-32 flex-col justify-center py-20 xl:scroll-mt-20"
    >
      <span
        aria-hidden="true"
        className="text-outline pointer-events-none absolute top-10 -left-1 font-heading text-[38vw] leading-none font-bold select-none sm:-left-20 sm:text-[15rem]"
      >
        {String(number).padStart(2, '0')}
      </span>

      <Reveal className="relative">
        <p className={eyebrow} style={{ color: 'var(--scene-accent)' }}>
          {t('story.stepOf', { current: number, total })}
        </p>
        <h2 id={titleId} ref={headingRef} tabIndex={-1} className="mt-2 font-heading text-4xl font-bold outline-none sm:text-6xl">
          {step.title}
        </h2>
      </Reveal>

      <div className="relative mt-8 space-y-6">
        {step.blocks.map((block, index) => (
          <Reveal key={index} delay={index * 100}>
            <VoiceBlock block={block} mediaById={mediaById} sourceById={sourceById} />
          </Reveal>
        ))}
      </div>

      {relations.length > 0 && <Relations relations={relations} sourceById={sourceById} />}
    </section>
  )
}

function VoiceBlock({ block, mediaById, sourceById }: { block: StoryBlock; mediaById: Map<string, Media>; sourceById: Map<string, Source> }) {
  return (
    <div className="glass relative space-y-4 overflow-hidden rounded-2xl p-5 pl-6 sm:p-7 sm:pl-8">
      <span aria-hidden="true" className={cn('absolute inset-y-5 left-0 w-1 rounded-r-full', VOICE_BAR[block.voice])} />
      <VoiceTag voice={block.voice} />
      <p className={cn('text-lg leading-relaxed sm:text-xl', block.voice === 'imagination' && 'italic')}>{block.text}</p>
      <BlockMedia ids={block.mediaIds ?? []} mediaById={mediaById} />
      <BlockSources ids={block.sourceIds} sourceById={sourceById} />
    </div>
  )
}

function BlockMedia({ ids, mediaById }: { ids: string[]; mediaById: Map<string, Media> }) {
  const items = ids.map((id) => mediaById.get(id)).filter((m): m is Media => m !== undefined)
  if (items.length === 0) return null
  return (
    <div className={items.length > 1 ? 'grid gap-3 sm:grid-cols-2' : ''}>
      {items.map((m) => (
        <MediaFigure key={m.id} media={m} />
      ))}
    </div>
  )
}

/** SOURCE-002: sources of a fact, one click away, without leaving the step. */
function BlockSources({ ids, sourceById }: { ids: string[]; sourceById: Map<string, Source> }) {
  const { t } = useTranslation()
  const sources = ids.map((id) => sourceById.get(id)).filter((s): s is Source => s !== undefined)
  if (sources.length === 0) return null
  return (
    <details className="group rounded-xl border border-white/10 bg-void/40 px-4 py-1">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-cosmic-indigo marker:text-moon-dust">
        {t('sources.count', { count: sources.length })}
      </summary>
      <div className="pt-1 pb-3">
        <SourceList sources={sources} />
      </div>
    </details>
  )
}

function Relations({ relations, sourceById }: { relations: Relation[]; sourceById: Map<string, Source> }) {
  const { t } = useTranslation()
  return (
    <Reveal className="mt-8">
      <section aria-labelledby="relations-title" className="glass rounded-2xl border-world/40 p-5 sm:p-7">
        <h3 id="relations-title" className="font-heading text-2xl font-bold">
          {t('story.relationsTitle')}
        </h3>
        <ul className="mt-4 space-y-6">
          {relations.map((r) => (
            <li key={r.id} className="relative pl-6">
              <span aria-hidden="true" className="absolute top-2 left-0 size-2.5 rounded-full bg-world shadow-[0_0_12px_var(--world-accent)]" />
              <RelationEnds relation={r} />
              <p className="mt-1 text-lg font-medium">{r.transmitted}</p>
              <p className="mt-1 text-sm text-moon-dust">
                <span className="font-semibold text-starlight">{t('story.evidence')} </span>
                {r.evidence}
              </p>
              <div className="mt-3">
                <BlockSources ids={r.sourceIds} sourceById={sourceById} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  )
}
