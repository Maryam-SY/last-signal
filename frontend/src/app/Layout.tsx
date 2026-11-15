import { Suspense } from 'react'
import { Link, Outlet, ScrollRestoration, useMatch } from 'react-router'
import { SoundToggle } from '@/components/audio/SoundToggle'
import { SpaceScene } from '@/components/celestial/SpaceScene'
import { CinemaLayer } from '@/components/motion/CinemaLayer'
import { CursorRing } from '@/components/motion/CursorRing'
import { LanguageSwitch } from '@/components/navigation/LanguageSwitch'
import { SiteNavigation } from '@/components/navigation/SiteNavigation'
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

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[2500]',
          isHome ? 'bg-gradient-to-b from-void/90 to-transparent' : 'glass-blur border-x-0 border-t-0',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <Link
            to={paths.home()}
            aria-label={t('nav.home')}
            className="group inline-flex min-h-11 min-w-11 shrink-0 items-center gap-2 font-heading text-lg font-bold"
          >
            <LogoMark />
            <span className="hidden min-[560px]:inline">{t('app.name')}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-1 sm:gap-3">
            <SiteNavigation />
            <SoundToggle />
            <LanguageSwitch />
          </div>
        </div>
      </header>

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

/**
 * The AeroReborn mark (2026-11-15): a lander shaped like the letter A, standing on a world's
 * horizon and still sending its signal — every machine passed something on. Decorative (the
 * link carries the name); the signal arcs light up in turn, unless motion is reduced.
 */
function LogoMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className="logo-mark size-8 shrink-0">
      <path d="M6 56 Q32 44 58 56" fill="none" stroke="#e5c58d" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />
      <g fill="none" stroke="#f1f5f9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 47 L30 20 L41 47" strokeWidth="4.8" />
        <path d="M23.4 37 H36.6" strokeWidth="4" />
        <path d="M15.5 47.5 H22.5 M37.5 47.5 H44.5" strokeWidth="3" />
      </g>
      <g fill="none" stroke="#61d6e8" strokeLinecap="round" strokeWidth="3.4">
        <path className="logo-wave" d="M36 13.6 A9 9 0 0 1 40.2 22.5" />
        <path className="logo-wave logo-wave-far" d="M40.5 7.8 A16 16 0 0 1 47.6 23.5" />
      </g>
      <circle cx="30" cy="20" r="3.8" fill="#61d6e8" />
    </svg>
  )
}

function SiteFooter() {
  const { t } = useTranslation()
  return (
    <footer className="relative z-20 border-t border-white/5 bg-void/80">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-stellar-cyan/50 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-lg font-bold">{t('app.name')}</p>
          <p className="mt-1 font-mono text-[0.68rem] tracking-[0.25em] text-stellar-cyan uppercase">{t('footer.tagline')}</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t('app.disclaimer')}</p>
        </div>
        <Link
          to={`${paths.about()}#about-sources`}
          className="inline-flex min-h-11 w-fit items-center rounded-full border border-moon-dust/30 px-4 text-sm font-medium transition-colors hover:border-stellar-cyan hover:text-stellar-cyan"
        >
          {t('footer.sources')}
        </Link>
      </div>
    </footer>
  )
}
