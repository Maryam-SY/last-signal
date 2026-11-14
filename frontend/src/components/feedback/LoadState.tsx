import { LoaderCircle, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface LoadStateProps {
  status: 'loading' | 'error'
  onRetry: () => void
  className?: string
}

/** Loading and error states of an API resource, announced politely to screen readers. */
export function LoadState({ status, onRetry, className }: LoadStateProps) {
  const { t } = useTranslation()
  if (status === 'loading') {
    return (
      <output className={cn('flex items-center gap-2 text-moon-dust', className)}>
        <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
        {t('common.loading')}
      </output>
    )
  }
  return (
    <div role="alert" className={cn('rounded-lg border border-stellar-border/70 bg-nebula-surface/40 p-4', className)}>
      <p className="text-moon-dust">{t('common.loadError')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-stellar-border px-4 text-sm font-medium hover:border-cosmic-indigo"
      >
        <RotateCcw aria-hidden className="size-4" />
        {t('common.retry')}
      </button>
    </div>
  )
}
