import type { DestinationId } from '@/types/content'

/**
 * Visual-only configuration for the celestial bodies shown on the landing page.
 *
 * Scientific copy (names, kinds, descriptions) lives in the i18n dictionaries so it can be
 * translated; this module only holds the deterministic data the SVG renderer needs.
 * The bodies and their photographs follow the NSSDCA "Lunar & Planetary Science" index
 * (Mercury … Comets). Photos: NASA/NSSDCA, public domain.
 */
export const BODY_IDS = ['moon', 'mars'] as const

export type BodyId = (typeof BODY_IDS)[number]

/**
 * `sphere` maps the photo onto the round body (clipped to the disc, with SVG shading).
 * `framed` keeps the full photo for bodies that are not spheres (comets, asteroids).
 */
export type ImageMode = 'sphere' | 'framed'

export interface PlanetPalette {
  light: string
  base: string
  dark: string
  accent: string
}

export interface PlanetRing {
  /** Rotation of the ring plane in degrees. */
  tilt: number
  inner: number
  outer: number
  color: string
  opacity: number
  width: number
}

/**
 * A world drawn as a real-time 3D globe (US-5.11): an equirectangular NASA texture map wrapped
 * on a lit sphere. Bodies without it keep the flat photograph (SVG Planet).
 */
export interface GlobeConfig {
  /** 2048×1024 colour map (always loaded first). */
  map: string
  /** 4096×2048 colour map, used when the globe is drawn large. */
  mapHd?: string
  /** 1024×512 colour map for phones and tablets (light graphics: 4 to 5 times lighter to download). */
  mapLite?: string
  /** Elevation map used as relief (grey levels). */
  bump?: string
  bumpScale?: number
  /** Tilt of the polar axis on screen, degrees (visual framing only). */
  axialTilt: number
  /** Thin glowing rim on the lit limb; omitted for airless worlds. */
  atmosphere?: { color: string; strength: number }
}

export interface CelestialBody {
  id: BodyId
  /** Present when the body has a full destination page. */
  destinationId?: DestinationId
  image: string
  imageMode: ImageMode
  palette: PlanetPalette
  rings?: PlanetRing
  globe?: GlobeConfig
  /**
   * Sidereal rotation period in hours (one turn on itself), from the NASA NSSDCA planetary
   * fact sheets (nssdc.gsfc.nasa.gov/planetary/factsheet/, consulted 2026-11-15). The globes
   * spin at their real relative speed: 1 second on screen = 1 hour (US-5.13).
   */
  rotationHours?: number
}

/** The two worlds of the site (US-5.14: the other planets, pure decoration, were removed). */
export const CELESTIAL_BODIES: readonly CelestialBody[] = [
  {
    id: 'moon',
    destinationId: 'moon',
    image: '/planets/moon.webp',
    imageMode: 'sphere',
    palette: { light: '#ece9e3', base: '#b4b1aa', dark: '#45433f', accent: '#8f8c86' },
    // NASA SVS CGI Moon Kit: LRO camera colour mosaic + LOLA elevation (public domain).
    globe: {
      map: '/planets/globe/moon-2k.webp',
      mapLite: '/planets/globe/moon-1k.webp',
      mapHd: '/planets/globe/moon-4k.webp',
      bump: '/planets/globe/moon-relief.webp',
      bumpScale: 2.2,
      axialTilt: 6.7,
    },
    rotationHours: 655.72,
  },
  {
    id: 'mars',
    destinationId: 'mars',
    image: '/planets/mars.webp',
    imageMode: 'sphere',
    palette: { light: '#f2a972', base: '#c25c33', dark: '#4f1f0f', accent: '#f6d9bf' },
    // USGS Astrogeology: Viking MDIM 2.1 colourised global mosaic (NASA/JPL/USGS, public domain).
    globe: {
      map: '/planets/globe/mars-2k.webp',
      mapLite: '/planets/globe/mars-1k.webp',
      mapHd: '/planets/globe/mars-4k.webp',
      axialTilt: 25.2,
      atmosphere: { color: '#ffb186', strength: 1.9 },
    },
    rotationHours: 24.6229,
  },
]

export function getBody(id: BodyId): CelestialBody {
  const body = CELESTIAL_BODIES.find((candidate) => candidate.id === id)
  if (!body) throw new Error(`Unknown celestial body: ${id}`)
  return body
}

export function getBodyByDestination(destinationId: DestinationId): CelestialBody | undefined {
  return CELESTIAL_BODIES.find((candidate) => candidate.destinationId === destinationId)
}
