import { Link, Outlet, ScrollRestoration, useMatch } from 'react-router'
import { SoundToggle } from '@/components/audio/SoundToggle'
import { SpaceScene } from '@/components/celestial/SpaceScene'
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
        <Outlet />
      </main>

      <SiteFooter />
      {/* New page → top; back/forward → where the visitor was. A story's ?step changes opt
          out with `preventScrollReset`. Pages opened from the address bar all get the key
          "default": key them by URL so one page never inherits another's position. */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname + location.search : location.key)} />
    </div>
  )
}

/** Orbit mark: a world and its satellite. Decorative (the link carries the name). */
function LogoMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-7 shrink-0">
      <defs>
        <radialGradient id="logo-world" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="55%" stopColor="#8b9dff" />
          <stop offset="100%" stopColor="#1c2638" />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="16" rx="14" ry="5.5" fill="none" stroke="#61d6e8" strokeOpacity="0.6" strokeWidth="1.2" transform="rotate(-24 16 16)" />
      <circle cx="16" cy="16" r="7" fill="url(#logo-world)" />
      <circle
        cx="28.2"
        cy="10.4"
        r="1.8"
        fill="#d97757"
        className="origin-[16px_16px] motion-safe:animate-[spin_9s_linear_infinite] motion-safe:group-hover:animate-[spin_2s_linear_infinite]"
      />
    </svg>
  )
}

function SiteFooter() {
  const { t, locale } = useTranslation()
  return (
    <footer className="relative z-20 border-t border-white/5 bg-void/80">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-stellar-cyan/50 to-transparent" />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-lg font-bold">{t('app.name')}</p>
          <p className="mt-1 font-mono text-[0.68rem] tracking-[0.25em] text-stellar-cyan uppercase">{t('footer.tagline')}</p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{t('app.disclaimer')}</p>
          {locale === 'wo' && <p className="mt-2 max-w-md text-xs text-stellar-gold">{t('lang.woDraft')}</p>}
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
