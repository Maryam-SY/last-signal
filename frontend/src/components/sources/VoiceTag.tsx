import { BookOpen, Lightbulb, Sparkles } from 'lucide-react'
import type { Voice } from '@/api/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

const STYLE = {
  data: { Icon: BookOpen, className: 'text-stellar-gold' },
  interpretation: { Icon: Lightbulb, className: 'text-cosmic-indigo' },
  imagination: { Icon: Sparkles, className: 'text-nebula-purple' },
} as const

/** STORY-007: the narrative voice is always written out (Fact / What it means / Imagine). */
export function VoiceTag({ voice }: { voice: Voice }) {
  const { t } = useTranslation()
  const { Icon, className } = STYLE[voice]
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-widest', className)}>
      <Icon aria-hidden="true" className="size-3.5" />
      {t(`voice.${voice}`)}
    </span>
  )
}
