import { Suspense } from 'react'
import { Outlet, ScrollRestoration, useMatch } from 'react-router'
import { SpaceScene } from '@/components/celestial/SpaceScene'
import { CinemaLayer } from '@/components/motion/CinemaLayer'
import { CursorRing } from '@/components/motion/CursorRing'
import { SiteFooter } from '@/components/navigation/SiteFooter'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { paths } from './paths'

export function Layout() {
  const { t } = useTranslation()
  // On the home journey the header melts into the 3D scene; elsewhere it is a frosted bar.
  const isHome = useMatch(paths.home()) !== null

  return (
    <div className="flex min-h-dvh flex-col">
      {/* One living sky for the whole site: it keeps flying from page to page (US-5.11). */}
      <SpaceScene bright={isHome} />
      {/* US-5.14 art direction: film grain and vignette over every page, and the cursor ring. */}
      <CinemaLayer />
      <CursorRing />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[3000] focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
      >
        {t('app.skipToContent')}
      </a>

      <SiteHeader home={isHome} />

      <main id="main-content" tabIndex={-1} className={cn('flex-1 outline-none', !isHome && 'pt-16')}>
        <Suspense fallback={<div aria-hidden="true" className="min-h-[70dvh]" />}>
          <Outlet />
        </Suspense>
      </main>

      <SiteFooter />
      {/* New page → top; back/forward → where the visitor was. A story's ?step changes opt
          out with `preventScrollReset`. Pages opened from the address bar all get the key
          "default": key them by URL so one page never inherits another's position. */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname + location.search : location.key)} />
    </div>
  )
}
