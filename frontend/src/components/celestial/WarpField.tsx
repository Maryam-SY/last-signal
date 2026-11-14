import { useEffect, useRef } from 'react'
import { useMotionLoop } from '@/hooks/useMotionLoop'

interface Star {
  x: number
  y: number
  z: number
  /** Previous projected position, for the motion streak. */
  px: number
  py: number
}

const BASE_SPEED = 0.00012 // depth units per ms while idle
const SPEED_PER_VELOCITY = 0.00011

function spawn(star: Star, far: boolean): void {
  star.x = (Math.random() * 2 - 1) * 1.2
  star.y = (Math.random() * 2 - 1) * 1.2
  star.z = far ? 1 : Math.random() * 0.95 + 0.05
  star.px = Number.NaN
  star.py = Number.NaN
}

interface Field {
  stars: Star[]
  width: number
  height: number
  ratio: number
  speed: number
}

function resizeField(canvas: HTMLCanvasElement, field: Field): void {
  // Render at CSS resolution: the field is a soft star streak layer, and a full-screen
  // canvas at devicePixelRatio 2 costs four times the fill rate for no visible gain.
  field.ratio = 1
  field.width = window.innerWidth
  field.height = window.innerHeight
  canvas.width = Math.round(field.width * field.ratio)
  canvas.height = Math.round(field.height * field.ratio)
  const count = Math.min(260, Math.round((field.width * field.height) / 6000))
  while (field.stars.length < count) {
    const star = { x: 0, y: 0, z: 0, px: Number.NaN, py: Number.NaN }
    spawn(star, false)
    field.stars.push(star)
  }
  field.stars.length = count
}

/** Three depth buckets: one stroke call each instead of one per star. */
const BUCKETS = [
  { alpha: 0.38, width: 0.6 },
  { alpha: 0.68, width: 1.2 },
  { alpha: 1, width: 1.9 },
] as const

function drawField(canvas: HTMLCanvasElement, field: Field, dt: number): void {
  const context = canvas.getContext('2d')
  if (!context) return
  const { width, height, ratio } = field
  const cx = width / 2
  const cy = height / 2
  const focal = Math.max(width, height) * 0.5
  const step = field.speed * dt

  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  context.lineCap = 'round'

  const paths: [Path2D, Path2D, Path2D] = [new Path2D(), new Path2D(), new Path2D()]

  for (const star of field.stars) {
    star.z -= step
    if (star.z <= 0.02) spawn(star, true)
    else if (star.z > 1) spawn(star, false)

    const sx = cx + (star.x / star.z) * focal
    const sy = cy + (star.y / star.z) * focal
    if (sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) {
      spawn(star, true)
      continue
    }

    const depth = 1 - star.z
    const fromX = Number.isNaN(star.px) ? sx : star.px
    const fromY = Number.isNaN(star.py) ? sy : star.py
    const path = paths[depth > 0.67 ? 2 : depth > 0.34 ? 1 : 0]
    path.moveTo(fromX, fromY)
    path.lineTo(sx + 0.01, sy + 0.01)

    star.px = sx
    star.py = sy
  }

  const strokeBucket = (path: Path2D, alpha: number, width: number) => {
    context.strokeStyle = `rgba(241,245,249,${alpha})`
    context.lineWidth = width
    context.stroke(path)
  }
  strokeBucket(paths[0], BUCKETS[0].alpha, BUCKETS[0].width)
  strokeBucket(paths[1], BUCKETS[1].alpha, BUCKETS[1].width)
  strokeBucket(paths[2], BUCKETS[2].alpha, BUCKETS[2].width)
}

/**
 * Fixed canvas of stars flying toward the viewer. Scrolling down accelerates them into
 * streaks; scrolling up sends them back. Pure canvas 2D, no dependency. Under reduced
 * motion it paints a single still frame.
 */
export function WarpField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef = useRef<Field>({ stars: [], width: 0, height: 0, ratio: 1, speed: BASE_SPEED })

  useEffect(() => {
    const canvas = canvasRef.current
    const field = fieldRef.current
    if (!canvas) return
    const resize = () => {
      resizeField(canvas, field)
      drawField(canvas, field, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useMotionLoop(({ dt, velocity }) => {
    const canvas = canvasRef.current
    const field = fieldRef.current
    if (!canvas) return
    field.speed += (BASE_SPEED + velocity * SPEED_PER_VELOCITY - field.speed) * 0.12
    drawField(canvas, field, dt)
  })

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-void">
      <div className="absolute top-[-20%] left-[-15%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(139,157,255,0.14),transparent_65%)] blur-3xl" />
      <div className="absolute right-[-20%] bottom-[-25%] h-[65vmax] w-[65vmax] rounded-full bg-[radial-gradient(circle,rgba(217,119,87,0.12),transparent_65%)] blur-3xl" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(8,11,18,0.85)_100%)]" />
    </div>
  )
}
