import { useId, useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useSearchParams } from 'react-router'
import type { DestinationDetail } from '@/api/types'
import { scrollToSection } from '@/hooks/useActiveSection'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'
import { gridLines, groupSites, project, viewAround, type LatLon, type MapMachine, type MapView, type Site } from './geo'

interface SiteMapProps {
  destination: DestinationDetail
}

/**
 * MAP-001 → 006 and SYNC-001/002 (US-3.3, US-3.4): a simplified equirectangular map of the
 * destination with one marker per site. The selected machine is the `?machine=` of the URL,
 * shared with the gallery: choosing a marker opens and shows its card; opening a card lights
 * up its marker. Only sourced coordinates are drawn (MAP-003).
 */
export function SiteMap({ destination }: SiteMapProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('machine')
  const panelId = useId()

  const { sites, unmapped } = useMemo(() => {
    const located: MapMachine[] = []
    const missing: string[] = []
    for (const mission of destination.missions) {
      for (const machine of mission.machines) {
        if (machine.coordinates) {
          located.push({
            id: machine.id,
            name: machine.name,
            missionName: mission.name,
            place: machine.locationName?.value ?? null,
            coordinates: machine.coordinates.value,
          })
        } else missing.push(machine.name)
      }
    }
    return { sites: groupSites(located), unmapped: missing }
  }, [destination])

  const view = useMemo(() => viewAround(sites), [sites])
  const selectedSite = sites.find((site) => site.machines.some((m) => m.id === selectedId)) ?? null
  const [openSiteId, setOpenSiteId] = useState<string | null>(null)
  const openSite = sites.find((site) => site.id === openSiteId) ?? selectedSite

  const selectMachine = (id: string) => {
    const next = new URLSearchParams(params)
    next.set('machine', id)
    setParams(next, { replace: true, preventScrollReset: true })
    // SYNC-001: bring the machine's card into view once it has re-rendered open.
    requestAnimationFrame(() => scrollToSection(document.getElementById(`machine-${id}`), reduced))
  }

  const onMarker = (site: Site) => {
    if (site.machines.length === 1) {
      setOpenSiteId(site.id)
      selectMachine(site.machines[0]!.id)
    } else {
      setOpenSiteId(site.id)
    }
  }

  const label = (site: Site) =>
    site.machines.length === 1
      ? t('map.markerOne', { name: site.machines[0]!.name, mission: site.machines[0]!.missionName })
      : t('map.markerMany', { place: site.place ?? site.machines[0]!.name, count: site.machines.length })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      <div>
        <fieldset className="glass relative aspect-[2/1] min-w-0 overflow-hidden rounded-2xl">
          <legend className="sr-only">{t('map.label', { destination: destination.name })}</legend>
          <Graticule view={view} />
          {sites.map((site) => {
            const { x, y } = project(site, view)
            const selected = site.id === selectedSite?.id
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onMarker(site)}
                aria-pressed={selected}
                aria-controls={site.machines.length > 1 ? panelId : undefined}
                aria-label={label(site)}
                className="group absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute inset-1 rounded-full border border-world/50 motion-safe:animate-ping',
                    !selected && 'opacity-60',
                  )}
                  style={{ animationDuration: '2.6s' }}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative flex items-center justify-center rounded-full border-2 font-mono text-[0.6rem] font-bold transition-all duration-200',
                    selected
                      ? 'size-6 border-starlight bg-world text-void shadow-[0_0_18px_var(--world-accent)] ring-2 ring-world ring-offset-2 ring-offset-void'
                      : 'size-4 border-world bg-void text-starlight group-hover:scale-125 group-focus-visible:scale-125',
                  )}
                >
                  {site.machines.length > 1 ? site.machines.length : ''}
                </span>
                {/* Place name next to the marker (decorative: the button's name already says it). */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute top-1/2 left-full hidden -translate-y-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.65rem] sm:block',
                    selected ? 'bg-world text-void' : 'bg-void/70 text-starlight',
                  )}
                >
                  {site.place ?? site.machines[0]!.name}
                </span>
              </button>
            )
          })}
          {selectedSite && <Crosshair point={selectedSite} view={view} />}
        </fieldset>

        <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono text-[0.68rem] text-moon-dust">
          <span>{t('map.disclaimer')}</span>
          {selectedSite && (
            <output className="text-world">
              {t('map.readout', { lat: formatLat(selectedSite.lat, t), lon: formatLon(selectedSite.lon, t) })}
            </output>
          )}
        </p>
        <p className="mt-1 text-xs text-moon-dust/80">{t('map.credit')}</p>
        {unmapped.length > 0 && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-moon-dust">
            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            {t('map.notMapped', { names: unmapped.join(', ') })}
          </p>
        )}
      </div>

      <aside className="space-y-4">
        <div id={panelId} aria-live="polite" className={cn('glass rounded-2xl p-4', !openSite && 'hidden lg:block')}>
          {openSite ? (
            <>
              <p className={cn(eyebrow, 'text-world')}>{t('map.siteTitle')}</p>
              {openSite.place && <p className="mt-1 font-heading text-lg font-bold">{openSite.place}</p>}
              <ul className="mt-3 space-y-2">
                {openSite.machines.map((machine) => (
                  <li key={machine.id}>
                    <button
                      type="button"
                      onClick={() => selectMachine(machine.id)}
                      aria-pressed={machine.id === selectedId}
                      className="flex min-h-11 w-full flex-col items-start justify-center rounded-xl border border-moon-dust/30 px-3 py-1.5 text-left text-sm transition-colors hover:border-world aria-pressed:border-world aria-pressed:bg-world/10"
                    >
                      <span className="font-medium">{machine.name}</span>
                      <span className="text-xs text-moon-dust">{machine.missionName}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-moon-dust">{t('map.intro')}</p>
          )}
        </div>

        <details className="glass rounded-2xl px-4 py-1 text-sm" open>
          <summary className="min-h-11 cursor-pointer content-center font-medium">{t('map.legendTitle')}</summary>
          <ul className="space-y-2 pb-3 text-moon-dust">
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-1 size-3 shrink-0 rounded-full border-2 border-world bg-void" />
              {t('map.legendSite')}
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-starlight bg-world ring-2 ring-world ring-offset-1 ring-offset-void" />
              {t('map.legendSelected')}
            </li>
            <li>{t('map.legendLatLon')}</li>
          </ul>
        </details>
      </aside>
    </div>
  )
}

type T = ReturnType<typeof useTranslation>['t']
const formatLat = (lat: number, t: T) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? t('map.north') : t('map.south')}`
const formatLon = (lon: number, t: T) => `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? t('map.east') : t('map.west')}`

/** Schematic grid: meridians and parallels every 15°, labelled every 30°, equator emphasised. */
function Graticule({ view }: { view: MapView }) {
  const { t } = useTranslation()
  const width = view.east - view.west
  const height = view.north - view.south
  const toX = (lon: number) => ((lon - view.west) / width) * 360
  const toY = (lat: number) => ((view.north - lat) / height) * 180

  const labelClass = 'pointer-events-none absolute font-mono text-[0.6rem] leading-none text-moon-dust/80 sm:text-[0.68rem]'
  return (
    <div aria-hidden="true" className="absolute inset-0">
    <svg viewBox="0 0 360 180" preserveAspectRatio="none" className="absolute inset-0 size-full">
      <defs>
        <radialGradient id="map-glow" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="var(--world-accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#080b12" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="360" height="180" fill="url(#map-glow)" />
      {gridLines(view.west, view.east, 15).map((lon) => (
        <line
          key={`m${lon}`}
          x1={toX(lon)}
          x2={toX(lon)}
          y1="0"
          y2="180"
          stroke="#94a3b8"
          strokeOpacity={lon === 0 ? 0.45 : 0.14}
          strokeWidth="0.4"
          strokeDasharray={lon === 0 ? undefined : '1.5 2.5'}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {gridLines(view.south, view.north, 15).map((lat) => (
        <line
          key={`p${lat}`}
          x1="0"
          x2="360"
          y1={toY(lat)}
          y2={toY(lat)}
          stroke={lat === 0 ? 'var(--world-accent)' : '#94a3b8'}
          strokeOpacity={lat === 0 ? 0.55 : 0.14}
          strokeWidth="0.4"
          strokeDasharray={lat === 0 ? undefined : '1.5 2.5'}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
      {gridLines(view.west, view.east, 30).map((lon) => (
        <span key={`ml${lon}`} className={cn(labelClass, 'bottom-1.5', lon % 60 !== 0 && 'max-sm:hidden')} style={{ left: `calc(${(toX(lon) / 360) * 100}% + 3px)` }}>
          {lon === 0 ? '0°' : `${Math.abs(lon)}°${lon > 0 ? t('map.east') : t('map.west')}`}
        </span>
      ))}
      {gridLines(view.south, view.north, 30).map((lat) => (
        <span key={`pl${lat}`} className={cn(labelClass, 'left-1.5')} style={{ top: `calc(${(toY(lat) / 180) * 100}% - 0.9rem)` }}>
          {lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? t('map.north') : t('map.south')}`}
        </span>
      ))}
    </div>
  )
}

/** Thin lines from the selected site to the edges: shows how latitude/longitude locate it. */
function Crosshair({ point, view }: { point: LatLon; view: MapView }) {
  const { x, y } = project(point, view)
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <span className="absolute top-0 bottom-0 w-px bg-world/40" style={{ left: `${x}%` }} />
      <span className="absolute right-0 left-0 h-px bg-world/40" style={{ top: `${y}%` }} />
    </div>
  )
}
