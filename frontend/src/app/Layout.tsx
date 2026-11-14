import { Link, Outlet, useMatch } from 'react-router'
import { SiteNavigation } from '@/components/navigation/SiteNavigation'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { paths } from './paths'

export function Layout() {
  const { t } = useTranslation()
  // On the home journey the header floats over the 3D scene instead of pushing it down.
  const isHome = useMatch(paths.home()) !== null

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        {t('app.skipToContent')}
      </a>

      <header
        className={cn(
          'z-20',
          isHome
            ? 'fixed inset-x-0 top-0 bg-gradient-to-b from-void/90 to-transparent'
            : 'relative border-b border-border bg-deep-space',
        )}
      >
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
