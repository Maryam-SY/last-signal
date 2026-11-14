import { Bot, Brush, Clapperboard, Map, MonitorPlay } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Media } from '@/types/content'

const ICONS = { artwork: Brush, simulation: MonitorPlay, diagram: Map, mixed: Clapperboard } as const

/**
 * Visible label for anything that is not a real photo or a document (CLAUDE.md §7, PRD
 * MEDIA-001): a drawing or a simulation must never be mistaken for evidence. Always text, never
 * a tooltip only.
 */
export function DepictionBadge({ media, className }: { media: Pick<Media, 'depiction' | 'aiGenerated'>; className?: string }) {
  const { t } = useTranslation()
  const depiction = media.depiction === 'photo' || media.depiction === 'document' ? null : media.depiction
  if (!depiction && !media.aiGenerated) return null
  const Icon = depiction ? ICONS[depiction] : Bot

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-stellar-gold/70 bg-void/85 px-2 py-1 text-xs font-medium text-stellar-gold',
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {depiction ? t(`media.depiction.${depiction}`) : t('media.aiGenerated')}
    </span>
  )
}
