/**
 * Minimal typings for the part of three.js used by the globes (components/celestial/globe).
 * `three` ships without types and `@types/three` is not a project dependency (CLAUDE.md §6):
 * only what createGlobe.ts calls is declared here. Extend it if more of three.js is used.
 */
declare module 'three' {
  export const SRGBColorSpace: string
  export const AdditiveBlending: number
  export const BackSide: number
  export const LinearMipmapLinearFilter: number

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number)
    x: number
    y: number
    z: number
    set(x: number, y: number, z: number): this
    normalize(): this
    clone(): Vector3
    copy(v: Vector3): this
  }

  export class Euler {
    x: number
    y: number
    z: number
  }

  export class Color {
    constructor(color?: string | number)
  }

  export class Object3D {
    position: Vector3
    rotation: Euler
    add(...objects: Object3D[]): this
  }

  export class Group extends Object3D {}
  export class Scene extends Object3D {}

  export class OrthographicCamera extends Object3D {
    constructor(left: number, right: number, top: number, bottom: number, near?: number, far?: number)
  }

  export class Light extends Object3D {}
  export class DirectionalLight extends Light {
    constructor(color?: string | number, intensity?: number)
  }
  export class AmbientLight extends Light {
    constructor(color?: string | number, intensity?: number)
  }

  export class BufferGeometry {
    dispose(): void
  }
  export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number)
  }

  export class Texture {
    constructor(image?: TexImageSource)
    colorSpace: string
    anisotropy: number
    minFilter: number
    needsUpdate: boolean
    dispose(): void
  }

  export class Material {
    transparent: boolean
    depthWrite: boolean
    dispose(): void
  }
  export class MeshStandardMaterial extends Material {
    constructor(parameters?: {
      map?: Texture | null
      bumpMap?: Texture | null
      bumpScale?: number
      roughness?: number
      metalness?: number
    })
  }
  export class ShaderMaterial extends Material {
    constructor(parameters?: {
      vertexShader?: string
      fragmentShader?: string
      uniforms?: Record<string, { value: unknown }>
      transparent?: boolean
      depthWrite?: boolean
      blending?: number
      side?: number
    })
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
  }

  export class WebGLRenderer {
    constructor(parameters?: {
      canvas?: HTMLCanvasElement
      antialias?: boolean
      alpha?: boolean
      powerPreference?: 'default' | 'high-performance' | 'low-power'
    })
    outputColorSpace: string
    capabilities: { getMaxAnisotropy(): number }
    setClearColor(color: number, alpha?: number): void
    setPixelRatio(ratio: number): void
    setSize(width: number, height: number, updateStyle?: boolean): void
    render(scene: Object3D, camera: Object3D): void
    dispose(): void
    forceContextLoss(): void
  }
}
