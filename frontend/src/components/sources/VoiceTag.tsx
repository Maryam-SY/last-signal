import { BookOpenCheck, Lightbulb, Sparkles, type LucideIcon } from 'lucide-react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import type { Voice } from '@/types/content'

const VOICES: Record<Voice, { icon: LucideIcon; className: string }> = {
  data: { icon: BookOpenCheck, className: 'border-stellar-gold/70 text-stellar-gold' },
  interpretation: { icon: Lightbulb, className: 'border-dashed border-cosmic-indigo/80 text-cosmic-indigo' },
  imagination: { icon: Sparkles, className: 'border-dotted border-nebula-purple/80 text-nebula-purple' },
}

/** "Fact" / "What it means" / "Imagine" — text + icon + border style, colour only reinforces (STORY-007). */
export function VoiceTag({ voice, className }: { voice: Voice; className?: string }) {
  const { t } = useTranslation()
  const { icon: Icon, className: voiceClass } = VOICES[voice]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.7rem] font-medium uppercase tracking-[0.14em]',
        voiceClass,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {t(`voice.${voice}`)}
    </span>
  )
}
