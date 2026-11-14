import type { Ref } from 'react'
import { useTranslation } from '@/i18n'
import type { ContentIndex } from '@/lib/contentIndex'
import { cn } from '@/lib/utils'
import type { NamedRelation, StoryStep } from '@/types/content'
import { RelationCard } from './RelationCard'
import { StoryBlock } from './StoryBlock'

interface StoryStepViewProps {
  step: StoryStep
  number: number
  total: number
  relations: readonly NamedRelation[]
  index: ContentIndex
  titleRef?: Ref<HTMLHeadingElement>
}

/** One of the six steps: number, title (focus target), blocks, and relations on the relay step. */
export function StoryStepView({ step, number, total, relations, index, titleRef }: StoryStepViewProps) {
  const { t } = useTranslation()
  const stepRelations = relations.filter((relation) => step.relationIds?.includes(relation.id))

  return (
    <section aria-labelledby={`story-step-${step.key}`}>
      <div className="flex items-baseline gap-4">
        <span
          aria-hidden
          className={cn(
            'font-heading text-6xl font-bold leading-none sm:text-7xl',
            step.key === 'discovery' ? 'text-stellar-gold/80' : 'text-stellar-cyan/30',
          )}
        >
          {String(number).padStart(2, '0')}
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-moon-dust">
            {t('story.stepOf', { current: number, total })}
          </p>
          <h2
            id={`story-step-${step.key}`}
            ref={titleRef}
            tabIndex={-1}
            className="font-heading text-3xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-cosmic-indigo sm:text-4xl"
          >
            {step.title}
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {step.blocks.map((block, blockIndex) => (
          <StoryBlock key={blockIndex} block={block} index={index} />
        ))}
      </div>

      {stepRelations.length > 0 && (
        <div className="mt-6 space-y-3">
          {stepRelations.map((relation) => (
            <RelationCard key={relation.id} relation={relation} sources={index.sources} />
          ))}
        </div>
      )}
    </section>
  )
}
