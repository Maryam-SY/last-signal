import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Media } from '@/api/types'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { MediaFigure } from '@/components/media/MediaFigure'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

export interface FlightItem {
  id: string
  /** Text of the moment: date, title, explanation (shown in the reading panel). */
  content: ReactNode
  /** Its picture, flown past in 3D; moments without a picture only have their text. */
  media?: Media
  /** Repeat the picture's own story in its caption (off when `content` already tells it). */
  withStory?: boolean
}

interface PhotoFlightProps {
  /** Accessible name of the list of moments (e.g. "Step by step"). */
  label: string
  items: readonly FlightItem[]
  className?: string
}

/** Distance (px) between two pictures along the corridor, and where a picture is "in focus". */
const GAP = 1700
const FOCUS = 560
const PERSPECTIVE = 1100
/** Scroll (in viewport heights) spent on each moment. */
const SCROLL_PER_ITEM = 0.9

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))

/**
 * Scrolling story told as a flight down a corridor of pictures (US-5.11): the stage stays
 * pinned, each moment's picture hangs on the left or right wall, tilted toward the visitor,
 * and comes closer as they scroll, then glides past; the moment's text changes in the reading
 * panel. Pictures are a decorative layer (aria-hidden, with their "not a photo" label); the
 * moments stay an ordered list with their caption and image for screen readers. Under reduced
 * motion the moments are a plain list with their pictures.
 */
export function PhotoFlight({ label, items, className }: PhotoFlightProps) {
  const reduced = useReducedMotion()
  if (items.length === 0) return null
  return reduced ? <StaticMoments label={label} items={items} className={className} /> : <Flight label={label} items={items} className={className} />
}

function StaticMoments({ label, items, className }: PhotoFlightProps) {
  const { t } = useTranslation()
  return (
    <ol aria-label={label} className={cn('space-y-14', className)}>
      {items.map((item) => (
        <li key={item.id} className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div>{item.content}</div>
          {item.media && (
            <MediaFigure media={item.media} lead={t('media.whatYouSee')} withStory={item.withStory ?? true} className="rounded-2xl" />
          )}
        </li>
      ))}
    </ol>
  )
}

function Flight({ label, items, className }: PhotoFlightProps) {
  const { t } = useTranslation()
  const sectionRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const planeRefs = useRef<Array<HTMLElement | null>>([])
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const barRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const active = useRef(-1)
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())
  // Pictures are fetched only when the flight is about to be reached.
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  const count = items.length

  useEffect(() => {
    const section = sectionRef.current
    if (!section || near) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '150% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [near])
  const pad = (n: number) => String(n).padStart(2, '0')

  // Full-bleed: the stage spans the whole window even inside a narrow column.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const place = () => {
      section.style.marginLeft = '0px'
      const left = section.getBoundingClientRect().left
      section.style.marginLeft = `${-left}px`
      section.style.width = `${document.documentElement.clientWidth}px`
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  useScrollFrame(({ viewportH }) => {
    const section = sectionRef.current
    const world = worldRef.current
    if (!section || !world) return
    const rect = section.getBoundingClientRect()
    if (rect.bottom < -viewportH || rect.top > viewportH * 1.5) return

    // 0 → 1 while the pinned stage is crossed; the camera flies from before the first picture
    // to just past the last one.
    const progress = clamp(-rect.top / Math.max(1, rect.height - viewportH))
    const camera = -0.45 + progress * (count - 1 + 0.9)
    world.style.transform = `translate3d(0, 0, ${(camera * GAP).toFixed(1)}px)`

    planeRefs.current.forEach((plane, index) => {
      if (!plane) return
      // Depth of the picture relative to the viewer (negative = still ahead).
      const z = -FOCUS - index * GAP + camera * GAP
      const appear = clamp((z + FOCUS + GAP * 2.6) / (GAP * 1.4))
      const leave = 1 - clamp((z + 150) / 450)
      plane.style.opacity = (appear * leave).toFixed(3)
      plane.style.visibility = appear * leave < 0.01 ? 'hidden' : 'visible'
    })

    const current = Math.round(clamp(camera, 0, count - 1))
    if (current !== active.current) {
      active.current = current
      itemRefs.current.forEach((item, index) => item?.classList.toggle('is-active', index === current))
      if (counterRef.current) counterRef.current.textContent = pad(current + 1)
    }
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`
  })

  return (
    <div
      ref={sectionRef}
      className={cn('photo-flight relative', className)}
      style={{ height: `${(count * SCROLL_PER_ITEM + 1) * 100}vh` }}
    >
      <div className="photo-flight-stage sticky top-0 h-dvh overflow-hidden" style={{ perspective: `${PERSPECTIVE}px` }}>
        {/* The corridor of pictures (decorative: the list below carries the same content). */}
        <div ref={worldRef} aria-hidden="true" className="photo-flight-world absolute inset-0">
          {items.map((item, index) => {
            if (!item.media || failed.has(item.id)) return null
            const side = index % 2 === 0 ? -1 : 1
            const style = {
              '--side': side,
              '--z': `${-FOCUS - index * GAP}px`,
              '--lift': `${((index % 3) - 1) * 5}vh`,
            } as CSSProperties
            return (
              <figure
                key={item.id}
                ref={(element) => {
                  planeRefs.current[index] = element
                }}
                className="photo-flight-plane"
                style={style}
              >
                <FlightImage
                  url={item.media.url}
                  near={near}
                  onError={() => setFailed((previous) => new Set(previous).add(item.id))}
                />
                <span className="absolute top-3 left-3">
                  <DepictionBadge depiction={item.media.depiction} />
                </span>
              </figure>
            )
          })}
        </div>

        {/* Shade under the reading panel, so the text always reads over the pictures. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-void via-void/75 to-transparent lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[46%] lg:bg-gradient-to-r"
        />

        <div className="absolute inset-x-0 bottom-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-10 lg:inset-y-0 lg:flex lg:items-center lg:pb-0 lg:pl-[max(2.5rem,calc((100vw-72rem)/2))]">
          <div className="relative max-w-xl lg:max-w-md">
            <p aria-hidden="true" className="flex items-baseline gap-2 font-mono text-xs tracking-[0.3em] text-world">
              <span ref={counterRef}>01</span>
              <span className="text-moon-dust">/ {pad(count)}</span>
            </p>
            <span aria-hidden="true" className="mt-2 block h-px w-40 bg-white/10">
              <span ref={barRef} className="block h-full origin-left bg-world" style={{ transform: 'scaleX(0)' }} />
            </span>
            <ol aria-label={label} className="photo-flight-items relative mt-4 grid">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  ref={(element) => {
                    itemRefs.current[index] = element
                  }}
                  className={cn('photo-flight-item col-start-1 row-start-1', index === 0 && 'is-active')}
                >
                  {item.content}
                  {item.media && (
                    <MediaFigure
                      media={item.media}
                      lead={t('media.whatYouSee')}
                      withStory={item.withStory ?? true}
                      captionOnly
                      className="mt-3"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Longest side (px) a flying picture is drawn at: plenty for a 720 px card on a 2× screen. */
const MAX_SIDE = 1400

/** Pictures are prepared one after the other, so a fast scroll never decodes ten at once. */
let preparing: Promise<unknown> = Promise.resolve()
function inTurn<T>(task: () => Promise<T>): Promise<T> {
  const run = preparing.then(task, task)
  preparing = run.catch(() => undefined)
  return run
}

/**
 * A picture of the flight, shrunk once to MAX_SIDE off the main thread (decode() and
 * createImageBitmap) and painted into a canvas. NASA originals reach 5000 × 3500 px: drawn as
 * plain <img> in a moving 3D layer they were re-rasterised at every scale change, freezing
 * the page for up to 2 s. Falls back to a plain <img> where canvas or decode() is missing.
 */
function FlightImage({ url, near, onError }: { url: string; near: boolean; onError: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'pending' | 'canvas' | 'img'>('pending')
  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (!near) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d') ?? null
    const image = new Image()
    if (!canvas || !context || typeof image.decode !== 'function') {
      setMode('img')
      return
    }
    let cancelled = false
    image.decoding = 'async'
    // Fetch, decode and shrink in turn; only the final (cheap) draw happens here.
    inTurn(async () => {
      if (cancelled) return null
      image.src = url
      await image.decode()
      const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight, 1))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))
      let source: CanvasImageSource = image
      if (typeof createImageBitmap === 'function') {
        try {
          source = await createImageBitmap(image, { resizeWidth: width, resizeHeight: height, resizeQuality: 'high' })
        } catch {
          // Draw the full image instead.
        }
      }
      return { source, width, height }
    })
      .then((prepared) => {
        if (!prepared) return
        const { source, width, height } = prepared
        if (!cancelled) {
          canvas.width = width
          canvas.height = height
          context.drawImage(source, 0, 0, width, height)
          setMode('canvas')
        }
        if (source instanceof ImageBitmap) source.close()
      })
      .catch(() => {
        if (!cancelled) onErrorRef.current()
      })
    return () => {
      cancelled = true
    }
  }, [near, url])

  if (mode === 'img') {
    return <img src={url} alt="" decoding="async" onError={() => onErrorRef.current()} className="size-full object-cover" />
  }
  return (
    <canvas
      ref={canvasRef}
      className={cn('size-full object-cover transition-opacity duration-500', mode === 'canvas' ? 'opacity-100' : 'opacity-0')}
    />
  )
}
