import { Link, Outlet } from 'react-router'
import { SiteNavigation } from '@/components/navigation/SiteNavigation'
import { useTranslation } from '@/i18n'
import { paths } from './paths'

export function Layout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        {t('app.skipToContent')}
      </a>

      <header className="relative z-20 border-b border-border bg-deep-space">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <Link to={paths.home()} className="inline-flex min-h-11 items-center font-heading text-lg font-bold">
            {t('app.name')}
          </Link>
          <SiteNavigation />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>

      <footer className="relative z-20 border-t border-border bg-deep-space">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">{t('app.disclaimer')}</p>
      </footer>
    </div>
  )
}
