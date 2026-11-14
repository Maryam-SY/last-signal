import { Link, useLocation } from 'react-router'
import { paths } from '@/app/paths'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

const linkClass =
  'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:decoration-stellar-cyan aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8'

export function SiteNavigation() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const isExplore =
    pathname === paths.home() || pathname.startsWith('/explore/') || pathname.startsWith('/stories/')
  const isAbout = pathname === paths.about()

  return (
    <nav aria-label={t('nav.label')}>
      <ul className="flex items-center gap-1">
        <li>
          <Link to={paths.home()} className={cn(linkClass)} aria-current={isExplore ? 'page' : undefined}>
            {t('nav.explore')}
          </Link>
        </li>
        <li>
          <Link to={paths.about()} className={cn(linkClass)} aria-current={isAbout ? 'page' : undefined}>
            {t('nav.about')}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
