import { Link, useLocation } from 'react-router'
import { paths } from '@/app/paths'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

const linkClass =
  'relative inline-flex min-h-11 items-center rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-3 aria-[current=page]:text-foreground after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-stellar-cyan after:transition-transform aria-[current=page]:after:scale-x-100'

export function SiteNavigation() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const isExplore =
    pathname === paths.home() || pathname.startsWith('/explore/') || pathname.startsWith('/stories/')
  const isAbout = pathname === paths.about()

  return (
    <nav aria-label={t('nav.label')}>
      <ul className="flex items-center sm:gap-1">
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
