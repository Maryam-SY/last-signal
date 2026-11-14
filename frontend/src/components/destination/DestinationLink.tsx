import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useTranslation } from '@/i18n'
import type { DestinationId } from '@/types/content'

interface DestinationLinkProps {
  id: DestinationId
}

/** Whole card is the click/tap target (DEST-003). Full visual design comes with US-2.1. */
export function DestinationLink({ id }: DestinationLinkProps) {
  const { t } = useTranslation()
  const cta = t(`destinations.${id}.cta`)

  return (
    <Link
      to={paths.destination(id)}
      aria-label={cta}
      className="group flex min-h-40 flex-col justify-end gap-2 rounded-xl border border-moon-dust/40 bg-card p-6 transition-colors hover:border-stellar-cyan hover:bg-deep-space"
    >
      <span className="font-heading text-3xl font-bold">{t(`destinations.${id}.name`)}</span>
      <span className="text-sm font-medium text-cosmic-indigo group-hover:underline">{cta} →</span>
    </Link>
  )
}
