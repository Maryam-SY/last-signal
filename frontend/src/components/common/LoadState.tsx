import { RadioTower } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface LoadStateProps {
  status: 'loading' | 'error'
  onRetry?: () => void
  /** Shape of the content being loaded, so the page does not jump when it arrives. */
  variant?: 'cards' | 'text'
  className?: string
}

/** Loading (skeleton) and error ("signal lost") states shared by every API-backed section. */
export function LoadState({ status, onRetry, variant = 'text', className }: LoadStateProps) {
  const { t } = useTranslation()

  if (status === 'loading') {
    return (
      <output className={cn('block py-4', className)}>
        <span className="sr-only">{t('loading.message')}</span>
        {/* US-5.14: the wait looks like a signal being acquired. */}
        <span aria-hidden="true" className="mb-3 flex items-center gap-3 font-mono text-[0.68rem] tracking-[0.3em] text-world uppercase">
          <span className="signal-acquire">
            <i />
            <i />
            <i />
            <i />
          </span>
          {t('loading.acquiring')}
        </span>
        {variant === 'cards' ? (
          <span aria-hidden="true" className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((i) => (
              <span key={i} className="glass block space-y-3 rounded-2xl p-5">
                <span className="skeleton block h-3 w-24 rounded-full" />
                <span className="skeleton block h-6 w-2/3 rounded-md" />
                <span className="skeleton block h-3 w-full rounded-full" />
                <span className="skeleton block h-3 w-5/6 rounded-full" />
                <span className="skeleton mt-4 block h-11 w-40 rounded-full" />
              </span>
            ))}
          </span>
        ) : (
          <span aria-hidden="true" className="block space-y-3">
            <span className="skeleton block h-4 w-11/12 rounded-full" />
            <span className="skeleton block h-4 w-4/5 rounded-full" />
            <span className="skeleton block h-4 w-2/3 rounded-full" />
          </span>
        )}
      </output>
    )
  }

  return (
    <div role="alert" className={cn('glass rounded-2xl border-destructive/50 p-5', className)}>
      <p className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.3em] text-destructive uppercase">
        <RadioTower aria-hidden="true" className="size-4" />
        {t('loading.signalLost')}
      </p>
      <p className="mt-2 font-medium">{t('loading.errorTitle')}</p>
      <p className="mt-1 text-sm text-moon-dust">{t('loading.errorHint')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-11 items-center rounded-full border border-moon-dust/50 px-5 text-sm font-medium transition-colors hover:border-stellar-cyan hover:text-stellar-cyan"
        >
          {t('loading.retry')}
        </button>
      )}
    </div>
  )
}
