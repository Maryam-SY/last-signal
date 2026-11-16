import { Link } from 'react-router'
import { ArrowUp } from 'lucide-react'
import { paths } from '@/app/paths'
import { LogoMark } from '@/components/brand/LogoMark'
import { useTranslation, type MessageKey } from '@/i18n'

const footerLink = 'inline-flex min-h-11 min-w-11 items-center text-sm text-moon-dust transition-colors hover:text-starlight'

/**
 * The site footer: the mark and the site's motto, two short columns of links (the worlds, the
 * project), a way back to the top, then the independence notice — over a large, faint
 * "OrbeMoria" (decorative).
 */
export function SiteFooter() {
  const { t } = useTranslation()
  const columns: { titleKey: MessageKey; links: { to: string; labelKey: MessageKey }[] }[] = [
    {
      titleKey: 'footer.explore',
      links: [
        { to: paths.home(), labelKey: 'footer.journey' },
        { to: paths.destination('moon'), labelKey: 'bodies.moon.name' },
        { to: paths.destination('mars'), labelKey: 'bodies.mars.name' },
      ],
    },
    {
      titleKey: 'footer.project',
      links: [
        { to: paths.about(), labelKey: 'nav.about' },
        { to: `${paths.about()}#about-sources`, labelKey: 'footer.sources' },
        { to: `${paths.about()}#about-credits`, labelKey: 'footer.credits' },
        { to: `${paths.about()}#about-ai`, labelKey: 'footer.ai' },
      ],
    },
  ]

  return (
    <footer className="site-footer relative z-40 overflow-hidden border-t border-white/5 bg-void/90">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-cosmic-cyan/60 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link to={paths.home()} aria-label={t('nav.home')} className="group inline-flex min-h-11 items-center gap-3">
              <LogoMark className="size-11" />
              <span className="font-heading text-xl font-bold text-starlight">{t('app.name')}</span>
            </Link>
            <p className="mt-5 max-w-sm font-heading text-lg leading-snug text-starlight/90">{t('explore.motto')}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-moon-dust">{t('footer.sourcesNote')}</p>
          </div>
          {columns.map((column) => (
            <nav key={column.titleKey} aria-label={t(column.titleKey)}>
              <p className="font-mono text-[0.72rem] tracking-[0.3em] text-pale-gold uppercase">{t(column.titleKey)}</p>
              <ul className="mt-3">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={footerLink}>
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-moon-dust">{t('app.disclaimer')}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-medium text-starlight transition-colors hover:border-cosmic-cyan hover:text-cosmic-cyan"
          >
            <ArrowUp aria-hidden="true" className="size-4" />
            {t('footer.top')}
          </button>
        </div>
      </div>
      {/* Decorative: the name, very large and faint, sinking under the bottom edge. */}
      <p aria-hidden="true" className="footer-wordmark pointer-events-none -mt-6 text-center font-heading font-bold whitespace-nowrap select-none">
        {t('app.name')}
      </p>
    </footer>
  )
}
