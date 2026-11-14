import { ArrowRight } from 'lucide-react'
import { SourceBadge } from '@/components/sources/SourceBadge'
import { useTranslation } from '@/i18n'
import type { NamedRelation, Source } from '@/types/content'

interface RelationCardProps {
  relation: NamedRelation
  sources: ReadonlyMap<string, Source>
  headingLevel?: 'h3' | 'h4'
}

/** What one machine or mission passed on to another, with the evidence and its sources (SOURCE-005). */
export function RelationCard({ relation, sources, headingLevel: Heading = 'h3' }: RelationCardProps) {
  const { t } = useTranslation()
  return (
    <article className="rounded-xl border border-stellar-cyan/40 bg-deep-space/80 p-4 sm:p-5">
      <Heading className="flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-lg font-semibold">
        <span>
          <span className="sr-only">{t('story.relayFrom')} </span>
          {relation.fromEntity?.name ?? relation.from.id}
        </span>
        <ArrowRight aria-hidden className="size-4 text-stellar-cyan" />
        <span>
          <span className="sr-only">{t('story.relayTo')} </span>
          {relation.toEntity?.name ?? relation.to.id}
        </span>
      </Heading>
      <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-stellar-cyan">
        {t(`relationType.${relation.type}`)}
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-starlight">{t('machine.transmitted')}</dt>
          <dd className="mt-0.5 text-moon-dust">{relation.transmitted}</dd>
        </div>
        <div>
          <dt className="font-semibold text-starlight">{t('machine.evidence')}</dt>
          <dd className="mt-0.5 text-moon-dust">{relation.evidence}</dd>
        </div>
      </dl>
      <SourceBadge sourceIds={relation.sourceIds} sources={sources} className="mt-2" />
    </article>
  )
}
