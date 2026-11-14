import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from '@/i18n'
import { ctaGhost, ctaPrimary } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface StoryControlsProps {
  current: number
  total: number
  stepTitle: string
  exitHref: string
  onGo: (step: number) => void
}

/**
 * STORY-005 / STORY-006: Previous / Next and Exit, always within thumb reach in a floating
 * bar. Progress never depends on scrolling alone. Short visible labels; the accessible
 * names keep the full wording (and contain the visible text).
 */
export function StoryControls({ current, total, stepTitle, exitHref, onGo }: StoryControlsProps) {
  const { t } = useTranslation()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="glass pointer-events-auto mx-auto flex max-w-3xl items-center gap-2 rounded-full p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]">
        <Link
          to={exitHref}
          className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2 text-sm font-medium text-moon-dust transition-colors hover:text-starlight sm:px-4"
        >
          <X aria-hidden="true" className="size-4" />
          <span className="max-sm:sr-only">{t('story.exit')}</span>
        </Link>

        <p aria-hidden="true" className="hidden min-w-0 flex-1 truncate text-center font-mono text-xs text-moon-dust sm:block">
          {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')} · <span className="text-starlight">{stepTitle}</span>
        </p>
        <span className="flex-1 sm:hidden" />

        <button
          type="button"
          onClick={() => onGo(current - 1)}
          disabled={current === 1}
          aria-label={t('story.previous')}
          className={cn(ctaGhost, 'border-transparent px-3 sm:px-4')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('story.previousShort')}
        </button>
        {current < total && (
          <button type="button" onClick={() => onGo(current + 1)} aria-label={t('story.next')} className={cn(ctaPrimary, 'group px-4')}>
            {t('story.nextShort')}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  )
}
