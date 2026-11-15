import { useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import type { Machine } from '@/api/types'
import { paths } from '@/app/paths'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { SignalBars } from '@/components/machine/SignalBars'
import { StatusBadge } from '@/components/machine/StatusBadge'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { keepHyphens } from '@/lib/keepHyphens'
import { useTranslation } from '@/i18n'
import { machineHook } from '@/lib/hook'
import { lastSignal } from '@/lib/lifespan'
import { ambientSrc, cardSrc } from '@/lib/mediaSrc'
import type { DestinationId } from '@/types/content'

/** Shared with the machine page's hero picture, so the browser morphs one into the other. */
export const MACHINE_TRANSITION_NAME = 'machine-focus'
/** Length of the "wake up" turn before flying to the machine's page (ms). */
const LAUNCH_MS = 750

interface MachinePortalProps {
  machine: Machine
  missionName: string
  destinationId: DestinationId
  index: number
  /** How many machines the hangar holds (dossier number "03 / 11"). */
  count: number
}

/**
 * One machine in the hangar (US-5.12), chosen like a planet on the home page: hovering (or
 * focusing) lights it up and tilts it toward the pointer; activating it makes it turn on
 * itself, then its picture flies into the machine's own page (View Transitions). The whole
 * card is one link; nothing depends on hover alone.
 */
export function MachinePortal({ machine, missionName, destinationId, index, count }: MachinePortalProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const navigate = useNavigate()
  const cardRef = useRef<HTMLAnchorElement>(null)
  const pictureRef = useRef<HTMLDivElement>(null)
  const to = paths.machine(destinationId, machine.id)
  const start = machine.date?.value.slice(0, 4)
  const end = machine.lifespan?.stillWorking?.value ? t('hangar.today') : lastSignal(machine.lifespan)?.value.slice(0, 4)
  const hook = machineHook(machine)

  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const card = cardRef.current
    if (!card || reduced) return
    const rect = card.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`)
    card.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`)
    card.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    card.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  const onPointerLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.setProperty('--rx', '0deg')
    card.style.setProperty('--ry', '0deg')
  }

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pictureRef.current) pictureRef.current.style.viewTransitionName = MACHINE_TRANSITION_NAME
    if (reduced || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    event.preventDefault()
    cardRef.current?.classList.add('is-launching')
    window.setTimeout(() => navigate(to, { viewTransition: true }), LAUNCH_MS)
  }

  return (
    <Link
      ref={cardRef}
      to={to}
      viewTransition
      onClick={onClick}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={start ? t('hangar.openYears', { name: machine.name, start, end: end ?? '?' }) : t('hangar.open', { name: machine.name })}
      className="machine-portal group relative block h-full rounded-3xl outline-offset-4"
      style={{ '--i': index } as CSSProperties}
    >
      <div className="machine-portal-body relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-deep-space">
        {/* The photo whole (never cropped) above the text, over a dimmed copy that fills the card. */}
        {machine.cover ? (
          <img src={ambientSrc(machine.cover)} alt="" aria-hidden="true" loading="lazy" decoding="async" className="machine-portal-ambient absolute inset-0 size-full object-cover" />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-nebula-surface to-void" />
        )}
        <div ref={pictureRef} className="relative aspect-[4/3] w-full shrink-0 px-3 pt-12 pb-1 sm:px-4">
          {machine.cover && (
            <img src={cardSrc(machine.cover)} alt="" loading="lazy" decoding="async" className="machine-portal-photo size-full object-contain" />
          )}
        </div>
        <span aria-hidden="true" className="machine-portal-glare pointer-events-none absolute inset-0" />
        {machine.cover && (
          <span className="absolute top-3 left-3">
            <DepictionBadge depiction={machine.cover.depiction} />
          </span>
        )}
        {/* US-5.14: dossier header — number in the hangar, catalogue id, signal strength. */}
        <div aria-hidden="true" className="dossier-line absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4 sm:p-5">
          <span>
            {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            {machine.nssdcaId && <span className="text-moon-dust"> · {machine.nssdcaId}</span>}
          </span>
          <span className="flex items-center gap-2">
            <span className="led" data-status={machine.status.value} />
            <SignalBars status={machine.status.value} />
          </span>
        </div>
        <div className="relative flex-1 bg-gradient-to-t from-void via-void/90 to-void/0 p-4 pt-5 sm:p-5">
          <p className="font-mono text-[0.72rem] tracking-[0.25em] text-world uppercase">{missionName}</p>
          <p className="mt-1 font-heading text-2xl leading-tight font-bold sm:text-[1.7rem]">{keepHyphens(machine.name)}</p>
          <p className="mt-1 text-xs text-moon-dust">{t(`machineType.${machine.type}`)}</p>
          {start && (
            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-starlight">
              <span>{start}</span>
              <span aria-hidden="true" className="machine-portal-beam h-px shrink-0 bg-world" />
              <span>{end ?? '?'}</span>
            </p>
          )}
          {hook && <p className="mt-2 text-sm font-medium text-starlight">{t(hook.key, hook.vars)}</p>}
          <div className="mt-2 text-starlight/80">
            <StatusBadge status={machine.status.value} />
          </div>
          <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold transition-colors group-hover:border-world group-hover:bg-world group-hover:text-void group-focus-visible:border-world group-focus-visible:bg-world group-focus-visible:text-void">
            {t('hangar.wake')}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  )
}

