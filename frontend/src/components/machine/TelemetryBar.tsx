import { MapPin } from 'lucide-react'
import type { MachineDetail } from '@/api/types'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { SignalBars } from './SignalBars'

/** Sourced coordinates as "1.95° S · 5.53° W" (east-positive longitude in the content). */
function formatCoordinates(lat: number, lon: number, t: (key: 'coords.n' | 'coords.s' | 'coords.e' | 'coords.w') => string): string {
  const latText = `${Math.abs(lat).toFixed(2)}° ${t(lat >= 0 ? 'coords.n' : 'coords.s')}`
  const lonText = `${Math.abs(lon).toFixed(2)}° ${t(lon >= 0 ? 'coords.e' : 'coords.w')}`
  return `${latText} · ${lonText}`
}

/**
 * The machine's telemetry line (US-5.14 art direction): a status light with its meaning
 * written out, the signal bars, its NSSDCA catalogue id, where it rests and its sourced
 * coordinates. Only facts the content holds; nothing is estimated here.
 */
export function TelemetryBar({ machine, className }: { machine: MachineDetail; className?: string }) {
  const { t } = useTranslation()
  const status = machine.status.value
  return (
    <dl className={cn('telemetry flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.72rem] tracking-[0.18em] text-moon-dust uppercase', className)}>
      <div className="flex items-center gap-2">
        <dt className="sr-only">{t('status.label')}</dt>
        <dd className="flex items-center gap-2 text-starlight">
          <span aria-hidden="true" className="led" data-status={status} />
          {t(`status.${status}`)}
          <SignalBars status={status} className="ml-1" />
        </dd>
      </div>
      {machine.nssdcaId && (
        <div className="flex items-center gap-2">
          <dt>{t('telemetry.catalog')}</dt>
          <dd className="text-starlight">{machine.nssdcaId}</dd>
        </div>
      )}
      {machine.locationName && (
        <div className="flex items-center gap-2">
          <dt className="sr-only">{t('telemetry.position')}</dt>
          <dd className="flex items-center gap-1.5 text-starlight normal-case tracking-normal">
            <MapPin aria-hidden="true" className="size-3.5 text-world" />
            {machine.locationName.value}
          </dd>
        </div>
      )}
      {machine.coordinates && (
        <div className="flex items-center gap-2">
          <dt className="sr-only">{t('telemetry.coordinates')}</dt>
          <dd className="text-starlight">{formatCoordinates(machine.coordinates.value.lat, machine.coordinates.value.lon, t)}</dd>
        </div>
      )}
    </dl>
  )
}
