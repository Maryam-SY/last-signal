import type { DestinationId } from '@/types/content'

/**
 * Visual-only configuration for the celestial bodies shown on the landing page.
 *
 * Scientific copy (names, kinds, descriptions) lives in the i18n dictionaries so it can be
 * translated; this module only holds the deterministic data the SVG renderer needs.
 * The bodies and their photographs follow the NSSDCA "Lunar & Planetary Science" index
 * (Mercury … Comets). Photos: NASA/NSSDCA, public domain.
 */
export const BODY_IDS = [
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'asteroids',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'comets',
] as const

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
}

export const CELESTIAL_BODIES: readonly CelestialBody[] = [
  {
    id: 'mercury',
    image: '/planets/mercury.webp',
    imageMode: 'sphere',
    palette: { light: '#c9c4bc', base: '#918b83', dark: '#3b3835', accent: '#6f6a63' },
  },
  {
    id: 'venus',
    image: '/planets/venus.webp',
    imageMode: 'sphere',
    palette: { light: '#f6e2b4', base: '#d9b879', dark: '#6f5126', accent: '#fbeecb' },
  },
  {
    id: 'earth',
    image: '/planets/earth.webp',
    imageMode: 'sphere',
    palette: { light: '#8fd0ff', base: '#2f7fd1', dark: '#082a52', accent: '#5ec27a' },
  },
  {
    id: 'moon',
    destinationId: 'moon',
    image: '/planets/moon.webp',
    imageMode: 'sphere',
    palette: { light: '#ece9e3', base: '#b4b1aa', dark: '#45433f', accent: '#8f8c86' },
    // NASA SVS CGI Moon Kit: LRO camera colour mosaic + LOLA elevation (public domain).
    globe: {
      map: '/planets/globe/moon-2k.webp',
      mapHd: '/planets/globe/moon-4k.webp',
      bump: '/planets/globe/moon-relief.webp',
      bumpScale: 2.2,
      axialTilt: 6.7,
    },
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
      mapHd: '/planets/globe/mars-4k.webp',
      axialTilt: 25.2,
      atmosphere: { color: '#ffb186', strength: 1.9 },
    },
  },
  {
    id: 'asteroids',
    image: '/planets/asteroids.webp',
    imageMode: 'framed',
    palette: { light: '#bbb4a9', base: '#7f786d', dark: '#302d28', accent: '#a49d92' },
  },
  {
    id: 'jupiter',
    image: '/planets/jupiter.webp',
    imageMode: 'sphere',
    palette: { light: '#f6e6cc', base: '#c99b6d', dark: '#5c3a22', accent: '#b25a3a' },
  },
  {
    id: 'saturn',
    image: '/planets/saturn.webp',
    imageMode: 'sphere',
    palette: { light: '#f9ebc9', base: '#d8bd85', dark: '#6b552f', accent: '#f7e4b5' },
    rings: { tilt: -18, inner: 60, outer: 104, color: '#f3e2b8', opacity: 0.9, width: 7 },
  },
  {
    id: 'uranus',
    image: '/planets/uranus.webp',
    imageMode: 'sphere',
    palette: { light: '#d2f8f6', base: '#7ed8dd', dark: '#25626f', accent: '#bdf0f1' },
    rings: { tilt: -78, inner: 58, outer: 84, color: '#bff2f2', opacity: 0.35, width: 2.5 },
  },
  {
    id: 'neptune',
    image: '/planets/neptune.webp',
    imageMode: 'sphere',
    palette: { light: '#a9d0ff', base: '#3f6fd6', dark: '#10265c', accent: '#d3e3ff' },
  },
  {
    id: 'pluto',
    image: '/planets/pluto.webp',
    imageMode: 'sphere',
    palette: { light: '#e9dccb', base: '#b69d84', dark: '#463629', accent: '#f1e7d9' },
  },
  {
    id: 'comets',
    image: '/planets/comets.webp',
    imageMode: 'framed',
    palette: { light: '#e3fbff', base: '#8fc4d6', dark: '#1c3843', accent: '#ffffff' },
  },
] as const

export function getBody(id: BodyId): CelestialBody {
  const body = CELESTIAL_BODIES.find((candidate) => candidate.id === id)
  if (!body) throw new Error(`Unknown celestial body: ${id}`)
  return body
}

export function getBodyByDestination(destinationId: DestinationId): CelestialBody | undefined {
  return CELESTIAL_BODIES.find((candidate) => candidate.destinationId === destinationId)
}
