import type { StoryStep } from '@/api/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface StepRailProps {
  steps: readonly StoryStep[]
  current: number
  onSelect: (step: number) => void
}

/**
 * STORY-004: ordered list of the six steps, current one marked (filled node + ring + bold
 * title + `aria-current="step"`), each one a jump. A slim bar under the header on phones
 * and tablets, a vertical constellation on the right from `xl` up.
 */
export function StepRail({ steps, current, onSelect }: StepRailProps) {
  const { t } = useTranslation()
  const total = steps.length
  const progress = total > 1 ? (current - 1) / (total - 1) : 1

  return (
    <nav
      aria-label={t('story.progressLabel')}
      className="fixed inset-x-0 top-16 z-40 border-b border-white/5 bg-void/75 backdrop-blur-md xl:inset-x-auto xl:top-1/2 xl:right-6 xl:-translate-y-1/2 xl:border-0 xl:bg-transparent xl:backdrop-blur-none"
    >
      <ol className="relative mx-auto flex max-w-md justify-between px-3 py-1 xl:max-w-none xl:flex-col xl:gap-2 xl:px-0 xl:py-0">
        {/* Constellation line and its fill (decorative). */}
        <span aria-hidden="true" className="absolute top-1/2 right-8 left-8 h-px bg-moon-dust/25 xl:hidden">
          <span className="block h-full origin-left bg-[var(--step-accent)] transition-transform duration-500" style={{ transform: `scaleX(${progress})` }} />
        </span>
        <span aria-hidden="true" className="absolute top-6 right-[1.375rem] bottom-6 hidden w-px bg-moon-dust/25 xl:block">
          <span className="block h-full origin-top bg-[var(--step-accent)] transition-transform duration-500" style={{ transform: `scaleY(${progress})` }} />
        </span>

        {steps.map((step, index) => {
          const n = index + 1
          const state = n === current ? 'current' : n < current ? 'done' : 'todo'
          return (
            <li key={step.key} className="relative">
              <button
                type="button"
                onClick={() => onSelect(n)}
                aria-current={state === 'current' ? 'step' : undefined}
                className="group flex min-h-11 min-w-11 items-center justify-center gap-3 rounded-full xl:flex-row-reverse"
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border font-mono text-xs transition-all duration-300',
                    state === 'current' && 'scale-110 border-transparent bg-starlight font-bold text-void ring-2 ring-[var(--step-accent)] ring-offset-2 ring-offset-void',
                    state === 'done' && 'border-[var(--step-accent)] bg-void text-starlight',
                    state === 'todo' && 'border-moon-dust/40 bg-void text-moon-dust group-hover:border-starlight group-hover:text-starlight',
                  )}
                >
                  {n}
                </span>
                <span
                  className={cn(
                    'sr-only text-right text-xs whitespace-nowrap xl:not-sr-only',
                    state === 'current' ? 'font-semibold text-starlight' : 'text-moon-dust group-hover:text-starlight',
                  )}
                >
                  {step.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
