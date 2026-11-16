import { useTranslation } from '@/i18n'
import { paths } from './paths'

/**
 * Rendered by the router when a route throws. Deliberately minimal (no Layout, no router
 * links) so it still renders if the layout itself is what failed.
 */
export function RouteErrorPage() {
  const { t } = useTranslation()

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">{t('error.title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('error.message')}</p>
      <a href={paths.home()} className="mt-6 inline-flex min-h-11 items-center text-cosmic-cyan hover:underline">
        {t('notFound.backHome')}
      </a>
    </main>
  )
}
