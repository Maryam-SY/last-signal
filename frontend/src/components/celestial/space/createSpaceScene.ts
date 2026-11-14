import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Texture,
  Vector2,
  WebGLRenderer,
} from 'three'

/**
 * The site's living sky (US-5.11): the NASA map of the Milky Way's glow (SVS "Deep Star Maps
 * 2020", stars removed) wrapped around the viewer and turning slowly, thousands of crisp distant
 * stars turning with it (denser along the galactic plane), and a field of 3D stars flying toward
 * the viewer — the feeling of travelling through space. Scrolling speeds the journey up (or reverses it).
 * One WebGL context for the whole site; loaded with `import()` only.
 */
export interface SpaceFrame {
  /** Seconds since the scene started. */
  time: number
  /** Distance travelled through the star field (scene units, may decrease). */
  travel: number
  /** Page scroll, for a little parallax tilt of the sky. */
  scrollY: number
  /** 0 = darkest veil … 1 = full sky (the home shows more of it). */
  brightness: number
}

export interface SpaceScene {
  resize: () => void
  render: (frame: SpaceFrame) => void
  dispose: () => void
}

/** Depth of the star tunnel; stars wrap from the far end when they pass the viewer. */
export const STAR_DEPTH = 140
const STAR_COUNT = 3200
const FAR_STAR_COUNT = 3600
const SKY_RADIUS = 300

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Image failed to load: ${url}`))
    image.src = url
  })
}

const SKY_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const SKY_FRAGMENT = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uBrightness;
  uniform vec2 uResolution;
  varying vec2 vUv;
  void main() {
    // Seen from inside: mirror u so the sky is not reversed.
    vec3 sky = texture2D(uMap, vec2(1.0 - vUv.x, vUv.y)).rgb;
    // Deeper blacks between the clouds of the Milky Way.
    sky = pow(sky, vec3(1.35));
    vec2 p = gl_FragCoord.xy / uResolution - 0.5;
    float vignette = 1.0 - smoothstep(0.25, 0.85, length(p * vec2(1.05, 1.0)));
    gl_FragColor = vec4(sky * uBrightness * (0.35 + 0.65 * vignette), 1.0);
  }
`

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTravel;
  uniform float uTime;
  uniform float uDepth;
  uniform float uScale;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    // Fly toward the viewer and wrap around: an endless tunnel of stars.
    p.z = -uDepth + mod(p.z + uDepth + uTravel, uDepth);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float distance = -mv.z;
    gl_PointSize = clamp(aSize * uScale / distance, 0.8, 14.0);
    float fadeFar = smoothstep(uDepth, uDepth * 0.55, distance);
    float fadeNear = smoothstep(0.6, 6.0, distance);
    float twinkle = 0.72 + 0.28 * sin(uTime * (1.2 + aSeed * 2.8) + aSeed * 40.0);
    vAlpha = fadeFar * fadeNear * twinkle;
    vColor = aColor;
    gl_Position = projectionMatrix * mv;
  }
`
const STAR_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float glow = core * core;
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`

const FAR_STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    gl_PointSize = aSize * uScale;
    vAlpha = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 60.0);
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** Star tints: mostly white, some blue-white, some warm, like a real sky. */
const TINTS: ReadonlyArray<readonly [number, number, number]> = [
  [1, 1, 1],
  [1, 1, 1],
  [0.8, 0.87, 1],
  [1, 0.9, 0.78],
  [0.92, 0.95, 1],
]

function buildStars(): BufferGeometry {
  const positions = new Float32Array(STAR_COUNT * 3)
  const sizes = new Float32Array(STAR_COUNT)
  const seeds = new Float32Array(STAR_COUNT)
  const colors = new Float32Array(STAR_COUNT * 3)
  let seed = 7
  const random = () => {
    // Deterministic, so the field is the same on every visit.
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let i = 0; i < STAR_COUNT; i += 1) {
    // Wide near the far end, so the screen stays filled; nothing straight in the camera axis.
    const angle = random() * Math.PI * 2
    const radius = 3 + Math.pow(random(), 0.7) * 85
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.7
    positions[i * 3 + 2] = -random() * STAR_DEPTH
    sizes[i] = 18 + Math.pow(random(), 3) * 90
    seeds[i] = random()
    const tint = TINTS[Math.floor(random() * TINTS.length)] ?? TINTS[0]!
    colors.set(tint, i * 3)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))
  geometry.setAttribute('aColor', new Float32BufferAttribute(colors, 3))
  return geometry
}

/** Distant stars on the sky sphere; about half crowd along the galactic plane (the equator). */
function buildFarStars(): BufferGeometry {
  const positions = new Float32Array(FAR_STAR_COUNT * 3)
  const sizes = new Float32Array(FAR_STAR_COUNT)
  const seeds = new Float32Array(FAR_STAR_COUNT)
  const colors = new Float32Array(FAR_STAR_COUNT * 3)
  let seed = 11
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const radius = SKY_RADIUS * 0.95
  for (let i = 0; i < FAR_STAR_COUNT; i += 1) {
    const lon = random() * Math.PI * 2
    let sinLat = random() * 2 - 1
    if (random() < 0.5) {
      // Gaussian-ish band of ±12° around the plane.
      const band = (random() + random() + random() - 1.5) * 0.42
      sinLat = Math.sin(band)
    }
    const cosLat = Math.sqrt(1 - sinLat * sinLat)
    positions[i * 3] = Math.cos(lon) * cosLat * radius
    positions[i * 3 + 1] = sinLat * radius
    positions[i * 3 + 2] = Math.sin(lon) * cosLat * radius
    // Mostly faint pin-pricks, a few bright ones.
    sizes[i] = 1.6 + Math.pow(random(), 5) * 7
    seeds[i] = random()
    const tint = TINTS[Math.floor(random() * TINTS.length)] ?? TINTS[0]!
    colors.set(tint, i * 3)
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seeds, 1))
  geometry.setAttribute('aColor', new Float32BufferAttribute(colors, 3))
  return geometry
}

function skyTexture(image: HTMLImageElement): Texture {
  const texture = new Texture(image)
  texture.minFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export function createSpaceScene(canvas: HTMLCanvasElement, skyImage: HTMLImageElement): SpaceScene {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'default' })
  renderer.setClearColor(0x080b12, 1)

  const scene = new Scene()
  const camera = new PerspectiveCamera(78, 1, 0.1, 400)

  // Sky sphere, tilted so the Milky Way crosses the screen diagonally.
  const skyMap = skyTexture(skyImage)
  const skyGeometry = new SphereGeometry(SKY_RADIUS, 64, 32)
  const resolution = new Vector2(1, 1)
  const skyMaterial = new ShaderMaterial({
    vertexShader: SKY_VERTEX,
    fragmentShader: SKY_FRAGMENT,
    uniforms: {
      uMap: { value: skyMap },
      uBrightness: { value: 0.6 },
      uResolution: { value: resolution },
    },
    side: BackSide,
    depthWrite: false,
  })
  const sky = new Mesh(skyGeometry, skyMaterial)
  const farGeometry = buildFarStars()
  const farMaterial = new ShaderMaterial({
    vertexShader: FAR_STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    uniforms: { uTime: { value: 0 }, uScale: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  // The sky and its distant stars turn together.
  const skySpin = new Group()
  skySpin.add(sky)
  skySpin.add(new Points(farGeometry, farMaterial))
  const skyTilt = new Group()
  skyTilt.rotation.z = -0.42
  skyTilt.add(skySpin)
  scene.add(skyTilt)

  const starGeometry = buildStars()
  const starMaterial = new ShaderMaterial({
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
    uniforms: {
      uTravel: { value: 0 },
      uTime: { value: 0 },
      uDepth: { value: STAR_DEPTH },
      uScale: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  scene.add(new Points(starGeometry, starMaterial))

  let width = 0
  let height = 0
  const resize = () => {
    const nextW = Math.max(1, window.innerWidth)
    const nextH = Math.max(1, window.innerHeight)
    if (nextW === width && nextH === height) return
    width = nextW
    height = nextH
    // A soft background: 1.5× is plenty, and keeps the fill cost low on retina screens.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(ratio)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    resolution.set(width * ratio, height * ratio)
    // Star sizes follow the screen height, so phones and big screens look alike.
    starMaterial.uniforms.uScale!.value = height / 900
    farMaterial.uniforms.uScale!.value = ratio
  }
  resize()

  const render = ({ time, travel, scrollY, brightness }: SpaceFrame) => {
    // The sky turns slowly (≈ one turn every 40 min) and leans a little with the scroll.
    // Start beside the galactic centre (too bright behind text), then turn slowly.
    skySpin.rotation.y = Math.PI / 2 + 0.62 + time * 0.0035
    skyTilt.rotation.x = Math.max(-0.12, Math.min(0.12, scrollY * -0.000025))
    skyMaterial.uniforms.uBrightness!.value = 0.22 + brightness * 0.38
    farMaterial.uniforms.uTime!.value = time
    starMaterial.uniforms.uTravel!.value = travel
    starMaterial.uniforms.uTime!.value = time
    renderer.render(scene, camera)
  }

  const dispose = () => {
    skyGeometry.dispose()
    skyMaterial.dispose()
    skyMap.dispose()
    farGeometry.dispose()
    farMaterial.dispose()
    starGeometry.dispose()
    starMaterial.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  return { resize, render, dispose }
}
