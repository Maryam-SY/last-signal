import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { paths } from '@/app/paths'
import { SoundToggle } from '@/components/audio/SoundToggle'
import { LogoMark } from '@/components/brand/LogoMark'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { useTranslation, type MessageKey } from '@/i18n'
import { cn } from '@/lib/utils'
import { LanguageSwitch } from './LanguageSwitch'

interface NavItem {
  to: string
  labelKey: MessageKey
  /** Short line under the link in the phone menu. */
  hintKey: MessageKey
  active: (pathname: string) => boolean
}

const NAV: readonly NavItem[] = [
  { to: paths.destination('moon'), labelKey: 'bodies.moon.name', hintKey: 'bodies.moon.kind', active: (p) => p.startsWith('/explore/moon') },
  { to: paths.destination('mars'), labelKey: 'bodies.mars.name', hintKey: 'bodies.mars.kind', active: (p) => p.startsWith('/explore/mars') },
  { to: paths.about(), labelKey: 'nav.about', hintKey: 'nav.aboutHint', active: (p) => p === paths.about() },
]

const linkClass =
  'relative inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap text-moon-dust transition-colors hover:text-starlight aria-[current=page]:text-starlight after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-stellar-cyan after:transition-transform hover:after:scale-x-50 aria-[current=page]:after:scale-x-100'

/**
 * The site header: the mark and the name (home link), the two worlds and "About & Sources", then
 * sound and language. A thin signal line fills as the page is read. On reading pages it slides
 * away when scrolling down and comes back on the way up (never while it holds the focus).
 * Phones: a "Menu" button opens a full-screen panel with large links, sound and language.
 */
export function SiteHeader({ home }: { home: boolean }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastY = useRef(0)

  useScrollFrame(({ scrollY, viewportH }) => {
    const delta = scrollY - lastY.current
    lastY.current = scrollY
    setScrolled(scrollY > 8)
    const focused = headerRef.current?.contains(document.activeElement) ?? false
    // The home page is one long scrolled journey: its (transparent) header always stays.
    if (home || scrollY < 120 || focused) setHidden(false)
    else if (delta > 6) setHidden(true)
    else if (delta < -6) setHidden(false)
    const progress = progressRef.current
    if (progress) {
      const max = document.documentElement.scrollHeight - viewportH
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0})`
    }
  })

  return (
    <header
      ref={headerRef}
      onFocus={() => setHidden(false)}
      className={cn(
        'site-header fixed inset-x-0 top-0 z-[2500] transition-[transform,background-color,border-color] duration-300 ease-out',
        hidden && !menuOpen && '-translate-y-full',
        home ? 'bg-gradient-to-b from-void/90 to-transparent' : scrolled ? 'site-header-glass' : 'bg-void/40',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          to={paths.home()}
          aria-label={t('nav.home')}
          className="group inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-full pr-2"
        >
          <LogoMark className="size-9" />
          <span className="font-heading text-[1.05rem] font-bold tracking-tight text-starlight">{t('app.name')}</span>
        </Link>

        <nav aria-label={t('nav.label')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} viewTransition className={linkClass} aria-current={item.active(pathname) ? 'page' : undefined}>
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-void/40 p-0.5 md:flex">
            <SoundToggle />
            <LanguageSwitch />
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-void/50 px-4 text-sm font-medium text-starlight transition-colors hover:border-stellar-cyan md:hidden"
          >
            <Menu aria-hidden="true" className="size-4" />
            {t('nav.menu')}
          </button>
        </div>
      </div>
      {!home && (
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-white/5">
          <span ref={progressRef} className="block h-full origin-left bg-gradient-to-r from-stellar-cyan via-stellar-cyan to-stellar-gold" style={{ transform: 'scaleX(0)' }} />
        </span>
      )}
      <PhoneMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </header>
  )
}

/** Phones: the full-screen menu (a modal dialog: focus stays inside, Escape closes it). */
function PhoneMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
      document.documentElement.classList.add('menu-open')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
    if (!open) document.documentElement.classList.remove('menu-open')
  }, [open])

  // A link was followed: the new page shows without the menu.
  useEffect(() => {
    onClose()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only on navigation
  }, [pathname])

  return (
    <dialog
      ref={dialogRef}
      aria-label={t('nav.menuTitle')}
      onClose={onClose}
      onCancel={onClose}
      className="phone-menu m-0 h-dvh max-h-none w-screen max-w-none bg-void p-0 text-starlight backdrop:bg-void/80"
    >
      {/* Its content exists only while it is open (one navigation in the page otherwise). */}
      {open && (
      <div className="flex h-full flex-col px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex h-14 items-center justify-between">
          <Link to={paths.home()} aria-label={t('nav.home')} className="inline-flex min-h-11 items-center gap-2.5">
            <LogoMark className="size-9" />
            <span className="font-heading text-lg font-bold">{t('app.name')}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.close')}
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-stellar-cyan"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label={t('nav.label')} className="mt-8 flex-1">
          <ul className="space-y-2">
            {NAV.map((item, index) => (
              <li key={item.to} className="phone-menu-item" style={{ animationDelay: `${80 + index * 60}ms` }}>
                <Link
                  to={item.to}
                  aria-current={item.active(pathname) ? 'page' : undefined}
                  className="group flex min-h-16 items-center justify-between gap-4 border-b border-white/10 py-3 aria-[current=page]:text-stellar-cyan"
                >
                  <span>
                    <span className="block font-heading text-3xl font-bold">{t(item.labelKey)}</span>
                    <span className="mt-1 block font-mono text-[0.72rem] tracking-[0.25em] text-moon-dust uppercase">{t(item.hintKey)}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-6 text-moon-dust transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <div className="flex items-center gap-2">
            <SoundToggle />
            <LanguageSwitch />
          </div>
          <p className="max-w-[12rem] text-right text-[0.72rem] leading-snug text-moon-dust">{t('app.disclaimer')}</p>
        </div>
      </div>
      )}
    </dialog>
  )
}
