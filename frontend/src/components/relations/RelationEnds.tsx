import { ArrowRight } from 'lucide-react'
import type { Relation } from '@/api/types'
import { useTranslation } from '@/i18n'

/** "From → To" of a relation, with names; the arrow is decorative, the words are read aloud. */
export function RelationEnds({ relation }: { relation: Relation }) {
  const { t } = useTranslation()
  const from = relation.fromEntity?.name
  const to = relation.toEntity?.name
  if (!from || !to) return null
  return (
    <p className="flex flex-wrap items-center gap-x-2 font-heading text-base font-semibold text-stellar-cyan">
      <span>
        <span className="sr-only">{t('relations.from')} </span>
        {from}
      </span>
      <ArrowRight aria-hidden="true" className="size-4" />
      <span>
        <span className="sr-only">{t('relations.to')} </span>
        {to}
      </span>
    </p>
  )
}
