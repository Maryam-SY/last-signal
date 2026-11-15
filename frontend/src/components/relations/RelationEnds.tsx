import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import type { EntityLabel, Relation } from '@/api/types'
import { paths } from '@/app/paths'
import { useTranslation } from '@/i18n'

/** Where an end of a relation leads: the machine's page, or the hangar of a mission's world. */
function hrefOf(entity: EntityLabel): string | null {
  if (!entity.destinationId) return null
  return entity.kind === 'machine' ? paths.machine(entity.destinationId, entity.id) : `${paths.destination(entity.destinationId)}#hangar`
}

function End({ entity, lead }: { entity: EntityLabel; lead: string }) {
  const href = hrefOf(entity)
  const name = (
    <>
      <span className="sr-only">{lead} </span>
      {entity.name}
    </>
  )
  return href ? (
    <Link to={href} viewTransition className="rounded underline-offset-4 hover:underline">
      {name}
    </Link>
  ) : (
    <span>{name}</span>
  )
}

/**
 * "From → To" of a relation, with names (US-5.15: each end links to its page, so the visitor
 * can follow what was passed on). The arrow is decorative; the words are read aloud.
 */
export function RelationEnds({ relation }: { relation: Relation }) {
  const { t } = useTranslation()
  if (!relation.fromEntity || !relation.toEntity) return null
  return (
    <p className="flex flex-wrap items-center gap-x-2 font-heading text-base font-semibold text-stellar-cyan">
      <End entity={relation.fromEntity} lead={t('relations.from')} />
      <ArrowRight aria-hidden="true" className="size-4" />
      <End entity={relation.toEntity} lead={t('relations.to')} />
    </p>
  )
}
