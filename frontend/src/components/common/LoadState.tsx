import { useTranslation } from '@/i18n'

interface LoadStateProps {
  status: 'loading' | 'error'
  onRetry?: () => void
}

/** Loading and error states shared by every API-backed section (announced to screen readers). */
export function LoadState({ status, onRetry }: LoadStateProps) {
  const { t } = useTranslation()

  if (status === 'loading') {
    return (
      <output className="block py-6 text-sm text-moon-dust">{t('loading.message')}</output>
    )
  }

  return (
    <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p className="font-medium">{t('loading.errorTitle')}</p>
      <p className="mt-1 text-sm text-moon-dust">{t('loading.errorHint')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-md border border-moon-dust/50 px-4 text-sm font-medium hover:bg-nebula-surface"
        >
          {t('loading.retry')}
        </button>
      )}
    </div>
  )
}
