import { Brush, Cpu, Film, Map } from 'lucide-react'
import type { Depiction } from '@/api/types'
import { useTranslation } from '@/i18n'

const ICONS = { artwork: Brush, simulation: Cpu, diagram: Map, mixed: Film } as const

/**
 * MEDIA-001: anything that is not a real photo (or a document) gets a visible text label,
 * so that a drawing or a simulation is never mistaken for evidence.
 */
export function DepictionBadge({ depiction }: { depiction: Depiction }) {
  const { t } = useTranslation()
  if (depiction === 'photo' || depiction === 'document') return null
  const Icon = ICONS[depiction]

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-pale-gold/60 bg-void/85 px-2.5 py-1 text-xs font-semibold text-pale-gold">
      <Icon aria-hidden="true" className="size-3.5" />
      {t(`depiction.${depiction}`)}
    </span>
  )
}
