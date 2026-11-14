import { HelpCircle } from 'lucide-react'
import type { MachineStatus } from '@/api/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

const STATUSES: readonly MachineStatus[] = ['operational', 'contact-lost', 'inactive', 'mission-ended', 'unknown']

/** EQUIP-005: what each status label means, in plain words (definitions of DATA_MODEL §3). */
export function StatusHelp({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <details className={cn('glass group rounded-2xl px-4 py-1', className)}>
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
        <HelpCircle aria-hidden="true" className="size-4 text-world" />
        {t('statusHelp.title')}
      </summary>
      <dl className="grid gap-3 pb-4 sm:grid-cols-2">
        {STATUSES.map((status) => (
          <div key={status}>
            <dt>
              <StatusBadge status={status} />
            </dt>
            <dd className="mt-0.5 pl-6 text-sm text-moon-dust">{t(`statusHelp.${status}`)}</dd>
          </div>
        ))}
      </dl>
    </details>
  )
}
