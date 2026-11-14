import {
  AdditiveBlending,
  BackSide,
  Color,
  DirectionalLight,
  AmbientLight,
  Group,
  LinearMipmapLinearFilter,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { GlobeConfig } from '@/content/celestialBodies'

/**
 * A real-time globe drawn with three.js (US-5.11): the NASA texture map of the world wrapped on
 * a sphere, lit by a sun so the day/night line is real, with an optional thin atmosphere rim.
 * This module is only ever loaded with `import()`, so three.js never weighs on the first page.
 */
export interface GlobeFrame {
  /** Surface rotation around the polar axis, degrees. */
  spin: number
  /** Pointer lean, -1 … 1 on each axis. */
  tiltX: number
  tiltY: number
}

export interface GlobeInstance {
  /** Resizes the drawing buffer to the canvas' CSS size (call when it changes). */
  resize: () => void
  render: (frame: GlobeFrame) => void
  dispose: () => void
}

/** Visible half-height of the scene: the globe (radius 1) fills ~75 % of the square canvas. */
const VIEW = 1.34
const DEG = Math.PI / 180

/** Decoded images are shared by every globe of the page (one download, one decode). */
const imageCache = new Map<string, Promise<HTMLImageElement>>()

function loadImage(url: string): Promise<HTMLImageElement> {
  let pending = imageCache.get(url)
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => {
        imageCache.delete(url)
        reject(new Error(`Texture failed to load: ${url}`))
      }
      image.src = url
    })
    imageCache.set(url, pending)
  }
  return pending
}

/** Starts fetching a globe's textures before any canvas exists (e.g. while the intro plays). */
export function preloadGlobe(config: GlobeConfig): void {
  void loadImage(config.map).catch(() => undefined)
  if (config.bump) void loadImage(config.bump).catch(() => undefined)
}

/** Fresnel rim: bright where the view grazes the sphere, transparent face-on. */
const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 world = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-world.xyz);
    gl_Position = projectionMatrix * world;
  }
`
const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = 1.0 - abs(dot(vNormal, vView));
    float glow = pow(rim, 2.4) * uStrength;
    // Only the lit side of the limb glows.
    float lit = smoothstep(-0.45, 0.5, dot(vNormal, uSun));
    gl_FragColor = vec4(uColor * glow * lit, glow * lit);
  }
`

/** Largest drawing size (CSS px) of a globe: beyond it the canvas is upscaled, never redrawn larger. */
const MAX_CSS_SIZE = 720

export function globePixelRatio(): number {
  return Math.min(window.devicePixelRatio || 1, 2)
}

/** Picks the 4k map when the globe is drawn larger than ~760 device pixels. */
export function globeMapUrl(config: GlobeConfig, devicePixels: number): string {
  return config.mapHd && devicePixels > 760 ? config.mapHd : config.map
}

const RIM_FRAGMENT = /* glsl */ `
  uniform vec3 uSun;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 4.0);
    float night = 1.0 - smoothstep(-0.2, 0.35, dot(vNormal, uSun));
    float a = rim * night * 0.32;
    gl_FragColor = vec4(vec3(0.75, 0.82, 1.0) * a, a);
  }
`

export async function createGlobe(canvas: HTMLCanvasElement, config: GlobeConfig, mapUrl = config.map): Promise<GlobeInstance> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'default' })
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const camera = new OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 10)
  camera.position.set(0, 0, 4)

  // The sun sits up-left and mostly in front: the world is seen almost full, with a soft
  // night crescent on the right — the disc stays visually centred.
  const sunDirection = new Vector3(-0.5, 0.3, 0.81).normalize()
  const sun = new DirectionalLight(0xfff6ea, 3.3)
  sun.position.copy(sunDirection)
  scene.add(sun)
  scene.add(new AmbientLight(0x9fb0ff, 0.1))

  const [mapImage, bumpImage] = await Promise.all([
    loadImage(mapUrl),
    config.bump ? loadImage(config.bump).catch(() => null) : Promise.resolve(null),
  ])

  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const map = new Texture(mapImage)
  map.colorSpace = SRGBColorSpace
  map.anisotropy = anisotropy
  map.minFilter = LinearMipmapLinearFilter
  map.needsUpdate = true
  const bumpMap = bumpImage ? new Texture(bumpImage) : null
  if (bumpMap) {
    bumpMap.anisotropy = anisotropy
    bumpMap.needsUpdate = true
  }

  const geometry = new SphereGeometry(1, 128, 96)
  const material = new MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: config.bumpScale ?? 0,
    roughness: 1,
    metalness: 0,
  })

  // Axis group: the world's axial tilt stays fixed while the surface spins inside it.
  const axis = new Group()
  axis.rotation.z = config.axialTilt * DEG
  const surface = new Mesh(geometry, material)
  axis.add(surface)
  const lean = new Group()
  lean.add(axis)
  scene.add(lean)

  // Cool rim light on the night side: the whole disc stays readable against the sky.
  const rimGeometry = new SphereGeometry(1.004, 96, 64)
  const rimMaterial = new ShaderMaterial({
    vertexShader: ATMOSPHERE_VERTEX,
    fragmentShader: RIM_FRAGMENT,
    uniforms: { uSun: { value: sunDirection.clone() } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  lean.add(new Mesh(rimGeometry, rimMaterial))

  let atmosphere: { geometry: SphereGeometry; material: ShaderMaterial } | null = null
  if (config.atmosphere) {
    const atmosphereGeometry = new SphereGeometry(1.06, 96, 64)
    const atmosphereMaterial = new ShaderMaterial({
      vertexShader: ATMOSPHERE_VERTEX,
      fragmentShader: ATMOSPHERE_FRAGMENT,
      uniforms: {
        uColor: { value: new Color(config.atmosphere.color) },
        uStrength: { value: config.atmosphere.strength },
        uSun: { value: sunDirection.clone() },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: BackSide,
    })
    scene.add(new Mesh(atmosphereGeometry, atmosphereMaterial))
    atmosphere = { geometry: atmosphereGeometry, material: atmosphereMaterial }
  }

  let width = 0
  let height = 0
  const resize = () => {
    // Layout size, not getBoundingClientRect(): inside the home's 3D scenes the bounding box is
    // magnified by the perspective, which once gave 6000 px buffers for a 250 px globe.
    const nextW = Math.max(1, Math.min(MAX_CSS_SIZE, canvas.clientWidth))
    const nextH = Math.max(1, Math.min(MAX_CSS_SIZE, canvas.clientHeight))
    if (nextW === width && nextH === height) return
    width = nextW
    height = nextH
    // Sharp on retina screens, but never more than 2× (fill rate grows with the square).
    renderer.setPixelRatio(globePixelRatio())
    renderer.setSize(width, height, false)
  }
  resize()

  const render = ({ spin, tiltX, tiltY }: GlobeFrame) => {
    surface.rotation.y = spin * DEG
    lean.rotation.x = tiltY * 0.22
    lean.rotation.y = tiltX * 0.22
    renderer.render(scene, camera)
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
    map.dispose()
    bumpMap?.dispose()
    rimGeometry.dispose()
    rimMaterial.dispose()
    atmosphere?.geometry.dispose()
    atmosphere?.material.dispose()
    renderer.dispose()
    // Give the context back now: browsers cap how many can live at once.
    renderer.forceContextLoss()
  }

  return { resize, render, dispose }
}
