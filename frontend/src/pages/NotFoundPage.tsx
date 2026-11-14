import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))

  return (
    <div className="relative">
      <SpaceBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <DriftingProbe />
        <p className={cn(eyebrow, 'mt-10 text-stellar-cyan')}>{t('notFound.eyebrow')}</p>
        <h1 className="text-glow mt-3 font-heading text-5xl font-bold sm:text-7xl">{t('notFound.title')}</h1>
        <p className="mt-4 max-w-md text-moon-dust sm:text-lg">{t('notFound.message')}</p>
        <Link to={paths.home()} className={cn(ctaPrimary, 'mt-10')}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  )
}

/** A small generic probe drifting off course (original drawing, decoration only). */
function DriftingProbe() {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 120" className="planet-float w-48 sm:w-60">
      <ellipse cx="80" cy="60" rx="74" ry="22" fill="none" stroke="#61d6e8" strokeOpacity="0.25" strokeDasharray="4 6" />
      <g transform="rotate(-18 80 60)">
        <rect x="18" y="52" width="38" height="16" rx="2" fill="#1c2638" stroke="#8b9dff" strokeOpacity="0.8" />
        <path d="M27 52v16M37 52v16M47 52v16" stroke="#8b9dff" strokeOpacity="0.5" />
        <rect x="104" y="52" width="38" height="16" rx="2" fill="#1c2638" stroke="#8b9dff" strokeOpacity="0.8" />
        <path d="M113 52v16M123 52v16M133 52v16" stroke="#8b9dff" strokeOpacity="0.5" />
        <path d="M56 60h10M94 60h10" stroke="#94a3b8" strokeWidth="2" />
        <rect x="66" y="46" width="28" height="28" rx="5" fill="#111827" stroke="#f1f5f9" strokeOpacity="0.85" />
        <circle cx="80" cy="60" r="6" fill="#e5c58d" fillOpacity="0.9" />
        <path d="M80 46V32" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="80" cy="30" r="3" fill="#d97757" className="motion-safe:animate-pulse" />
      </g>
    </svg>
  )
}
