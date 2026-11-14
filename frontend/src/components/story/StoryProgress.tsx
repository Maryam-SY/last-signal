import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { StoryStep } from '@/types/content'

interface StoryProgressProps {
  steps: readonly StoryStep[]
  current: number
  onSelect: (step: number) => void
}

/** The six steps as an ordered list; the current one is marked with aria-current="step". */
export function StoryProgress({ steps, current, onSelect }: StoryProgressProps) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('story.progressLabel')}>
      <ol className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {steps.map((step, index) => {
          const number = index + 1
          const state = number === current ? 'current' : number < current ? 'done' : 'todo'
          return (
            <li key={step.key}>
              <button
                type="button"
                aria-current={state === 'current' ? 'step' : undefined}
                aria-label={t('story.goToStep', { number, title: step.title })}
                onClick={() => onSelect(number)}
                className="group flex min-h-11 w-full flex-col items-start justify-end gap-1.5 rounded-md pt-1 text-left"
              >
                <span
                  aria-hidden
                  className={cn(
                    'hidden font-mono text-[0.65rem] uppercase tracking-[0.18em] sm:block',
                    state === 'current' ? 'text-stellar-cyan' : 'text-moon-dust group-hover:text-starlight',
                  )}
                >
                  {String(number).padStart(2, '0')} {step.title}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'block w-full rounded-full transition-[background-color] duration-200 motion-reduce:transition-none',
                    state === 'current' && 'h-2 bg-stellar-cyan',
                    state === 'done' && 'h-1 bg-stellar-cyan/60',
                    state === 'todo' && 'h-1 bg-moon-dust/40 group-hover:bg-moon-dust',
                  )}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
