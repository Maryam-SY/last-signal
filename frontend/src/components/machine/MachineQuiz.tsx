import { useState } from 'react'
import { CheckCircle2, CircleX, RotateCcw } from 'lucide-react'
import type { MachineDetail } from '@/api/types'
import { HudCorners } from '@/components/common/HudCorners'
import { useTranslation } from '@/i18n'
import { buildQuiz, type QuizOption } from '@/lib/quiz'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface MachineQuizProps {
  machine: MachineDetail
  world: string
  className?: string
}

/**
 * "What did you remember?" (US-5.15): three questions built only from the machine's sourced
 * facts. Every answer gets a written verdict and the fact itself, so a wrong guess teaches as
 * much as a right one. Nothing is stored and nothing is sent.
 */
export function MachineQuiz({ machine, world, className }: MachineQuizProps) {
  const { t } = useTranslation()
  const questions = buildQuiz(machine, world)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  if (questions.length === 0) return null

  const label = (option: QuizOption) => option.text ?? (option.key ? t(option.key, option.vars) : '')
  const answered = Object.keys(answers).length
  const score = questions.filter((q) => {
    const picked = answers[q.id]
    return picked !== undefined && q.options[picked]?.correct
  }).length

  return (
    <div className={cn('reading-panel relative rounded-3xl p-6 sm:p-10', className)}>
      <HudCorners />
      <p className={cn(eyebrow, 'text-world')}>{t('quiz.eyebrow')}</p>
      <h3 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">{t('quiz.title')}</h3>
      <p className="mt-2 text-starlight/85">{t('quiz.intro', { name: machine.name })}</p>

      <ol className="mt-8 space-y-8">
        {questions.map((question, index) => {
          const picked = answers[question.id]
          const done = picked !== undefined
          const right = done && question.options[picked]?.correct
          return (
            <li key={question.id}>
              <p className="font-heading text-xl font-semibold sm:text-2xl">
                <span className="mr-2 font-mono text-sm text-world">{String(index + 1).padStart(2, '0')}</span>
                {t(question.key, question.vars)}
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const chosen = picked === optionIndex
                  const reveal = done && (option.correct || chosen)
                  return (
                    <li key={optionIndex}>
                      <button
                        type="button"
                        disabled={done}
                        aria-pressed={chosen}
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                        className={cn(
                          'quiz-option flex min-h-11 w-full items-center gap-3 rounded-2xl border px-4 py-2 text-left text-base transition-colors',
                          !done && 'border-white/15 hover:border-world hover:bg-white/5',
                          done && !reveal && 'border-white/5 text-moon-dust',
                          reveal && option.correct && 'border-world bg-world/15 font-semibold',
                          reveal && !option.correct && 'border-white/20 line-through',
                        )}
                      >
                        {reveal && option.correct && <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-world" />}
                        {reveal && !option.correct && <CircleX aria-hidden="true" className="size-5 shrink-0" />}
                        <span>{label(option)}</span>
                        {reveal && <span className="sr-only">{option.correct ? t('quiz.correctOption') : t('quiz.wrongOption')}</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {done && (
                <output className="quiz-verdict mt-3 block rounded-2xl bg-white/5 px-4 py-3 text-sm leading-relaxed sm:text-base">
                  <span className="font-semibold text-world">{right ? t('quiz.right') : t('quiz.wrong')} </span>
                  {t(question.explain.key, question.explain.vars)}
                </output>
              )}
            </li>
          )
        })}
      </ol>

      {answered === questions.length && (
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          <p className="font-heading text-2xl font-bold">{t('quiz.score', { score, total: questions.length, name: machine.name })}</p>
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold hover:border-world hover:text-world"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            {t('quiz.again')}
          </button>
        </div>
      )}
    </div>
  )
}
