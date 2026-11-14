import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from '@/i18n'
import type { ContentIndex } from '@/lib/contentIndex'
import type { NamedRelation, StoryDetail } from '@/types/content'
import { StoryProgress } from './StoryProgress'
import { StoryStepView } from './StoryStepView'
import { StoryTransition } from './StoryTransition'

interface StoryExperienceProps {
  story: Pick<StoryDetail, 'steps'>
  relations: readonly NamedRelation[]
  index: ContentIndex
  /** Current step, 1-based (already validated by the caller). */
  step: number
  onStepChange: (step: number) => void
  /** Exit link, always available (STORY-006). */
  exit: ReactNode
  /** End-of-story choices shown on the last step instead of "Next" (STORY-008). */
  end: ReactNode
}

/**
 * Six-step story, controlled and router-agnostic (ARCHITECTURE §10): it renders the current
 * step and asks its parent to change step. Focus moves to the step title on every change.
 */
export function StoryExperience({ story, relations, index, step, onStepChange, exit, end }: StoryExperienceProps) {
  const { t } = useTranslation()
  const total = story.steps.length
  const current = story.steps[step - 1] ?? story.steps[0]
  const titleRef = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)

  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    titleRef.current?.focus()
  }, [step])

  const isFirst = step <= 1
  const isLast = step >= total
  // The backend guarantees six steps; an empty story simply renders nothing.
  if (!current) return null

  return (
    <div>
      <StoryProgress steps={story.steps} current={step} onSelect={onStepChange} />

      <div className="mt-8 min-h-[50vh]">
        <StoryTransition stepKey={current.key}>
          <StoryStepView
            step={current}
            number={step}
            total={total}
            relations={relations}
            index={index}
            titleRef={titleRef}
          />
        </StoryTransition>
      </div>

      {isLast && <div className="mt-10">{end}</div>}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-stellar-border/60 pt-5">
        <button
          type="button"
          onClick={() => onStepChange(step - 1)}
          disabled={isFirst}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-moon-dust/60 px-4 text-sm font-medium hover:border-starlight disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t('story.previous')}
        </button>
        {exit}
        {!isLast && (
          <button
            type="button"
            onClick={() => onStepChange(step + 1)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-cosmic-indigo px-5 text-sm font-semibold text-void hover:bg-cosmic-indigo/85"
          >
            {t('story.next')}
            <ArrowRight aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
