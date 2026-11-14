/**
 * Equirectangular geometry for the site map (MAP-001): longitude east-positive in [-180, 180],
 * latitude in [-90, 90]. Pure functions, unit-tested.
 */

export interface LatLon {
  lat: number
  lon: number
}

export interface MapMachine {
  id: string
  name: string
  missionName: string
  place: string | null
  coordinates: LatLon
}

export interface Site extends LatLon {
  id: string
  place: string | null
  machines: MapMachine[]
}

export interface MapView {
  west: number
  east: number
  south: number
  north: number
}

/** Machines closer than this (degrees, both axes) share one site marker (MAP-002 §4). */
export const SITE_RADIUS_DEG = 2

/** Groups machines into sites; a site sits on its first machine (no averaging, no invented point). */
export function groupSites(machines: readonly MapMachine[]): Site[] {
  const sites: Site[] = []
  for (const machine of machines) {
    const { lat, lon } = machine.coordinates
    const site = sites.find((s) => Math.abs(s.lat - lat) <= SITE_RADIUS_DEG && Math.abs(s.lon - lon) <= SITE_RADIUS_DEG)
    if (site) site.machines.push(machine)
    else sites.push({ id: machine.id, lat, lon, place: machine.place, machines: [machine] })
  }
  return sites
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * The part of the surface to show: every site plus a margin, at least 120° wide, always 2:1
 * (so the projection is never distorted), never beyond the globe.
 */
export function viewAround(sites: readonly LatLon[], margin = 30, minWidth = 120): MapView {
  if (sites.length === 0) return { west: -180, east: 180, south: -90, north: 90 }
  const lons = sites.map((s) => s.lon)
  const lats = sites.map((s) => s.lat)
  let width = Math.max(minWidth, Math.max(...lons) - Math.min(...lons) + 2 * margin)
  let height = Math.max(Math.max(...lats) - Math.min(...lats) + 2 * margin, width / 2)
  width = Math.min(360, Math.max(width, height * 2))
  height = Math.min(180, width / 2)
  const centerLon = clamp((Math.max(...lons) + Math.min(...lons)) / 2, -180 + width / 2, 180 - width / 2)
  const centerLat = clamp((Math.max(...lats) + Math.min(...lats)) / 2, -90 + height / 2, 90 - height / 2)
  return { west: centerLon - width / 2, east: centerLon + width / 2, south: centerLat - height / 2, north: centerLat + height / 2 }
}

/** Position of a point inside the view, in percent of its width and height. */
export function project(point: LatLon, view: MapView): { x: number; y: number } {
  return {
    x: ((point.lon - view.west) / (view.east - view.west)) * 100,
    y: ((view.north - point.lat) / (view.north - view.south)) * 100,
  }
}

/** Multiples of `step` inside [min, max]. */
export function gridLines(min: number, max: number, step: number): number[] {
  const lines: number[] = []
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) lines.push(Math.round(value))
  return lines
}
