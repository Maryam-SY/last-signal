import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { Media } from '@/api/types'
import { ZoomIn } from 'lucide-react'
import { HudCorners } from '@/components/common/HudCorners'
import { Lightbox } from '@/components/media/Lightbox'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { MediaFigure } from '@/components/media/MediaFigure'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { useTranslation } from '@/i18n'
import { cardSrc, sceneSrc } from '@/lib/mediaSrc'
import { setBringIntoView } from '@/lib/readAlong'
import { cn } from '@/lib/utils'

export interface FlightItem {
  id: string
  /** Text of the moment: date, title, explanation (shown in the reading panel). */
  content: ReactNode
  /** Its picture, flown past in 3D; moments without a picture only have their text. */
  media?: Media
  /** Repeat the picture's own story in its caption (off when `content` already tells it). */
  withStory?: boolean
  /** Mission clock shown over the flight while this moment is in front (US-5.13). */
  hud?: string
  /** No caption under the text (the text already is the picture's caption). */
  hideCaption?: boolean
}

interface PhotoFlightProps {
  /** Accessible name of the list of moments (e.g. "Step by step"). */
  label: string
  items: readonly FlightItem[]
  className?: string
}

/** Depth of the stage (px): pictures and text are tilted toward each other in it. */
const PERSPECTIVE = 1100
/**
 * Scroll spent on each moment, in viewport heights: `--flight-per` in CSS (0.9 on large
 * screens, shorter on phones, where each moment also snaps into place — US-5.13).
 */

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
  const hudRef = useRef<HTMLParagraphElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const active = useRef(-1)
  // Phones (US-5.13): the picture of the moment in front fills the screen behind its text.
  const [shown, setShown] = useState(0)
  const [zoom, setZoom] = useState<Media | null>(null)
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())
  // Pictures are fetched only when the flight is about to be reached.
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  const count = items.length
  // Wide screens show the corridor of pictures, phones and tablets the picture as background:
  // a hidden layout must not download its pictures (CSS hiding does not stop the download).
  const [wide, setWide] = useState(() => typeof window === 'undefined' || !window.matchMedia || window.matchMedia(WIDE).matches)

  useEffect(() => {
    if (!window.matchMedia) return
    const query = window.matchMedia(WIDE)
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

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

  // Read-along (US-5.12): the narration reaches a moment → fly the camera to it.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const unregister = itemRefs.current.map((item, index) =>
      item
        ? setBringIntoView(item, (behavior) => {
            const rect = section.getBoundingClientRect()
            const progress = clamp((index + 0.02) / count)
            const top = window.scrollY + rect.top + progress * Math.max(1, rect.height - window.innerHeight)
            window.scrollTo({ top, behavior })
          })
        : undefined,
    )
    return () => unregister.forEach((off) => off?.())
  }, [count])

  useScrollFrame(({ viewportH }) => {
    const section = sectionRef.current
    const world = worldRef.current
    if (!section || !world) return
    const rect = section.getBoundingClientRect()
    if (rect.bottom < -viewportH || rect.top > viewportH * 1.5) return

    // 0 → 1 while the pinned stage is crossed. US-5.15: no continuous zoom any more — the
    // scroll only decides WHICH moment is in front; the change itself is a clean transition
    // (CSS), the pictures keep their size.
    const progress = clamp(-rect.top / Math.max(1, rect.height - viewportH))
    const current = Math.min(count - 1, Math.floor(progress * count + 0.0001))
    if (current !== active.current) {
      const previous = active.current
      active.current = current
      setShown(current)
      itemRefs.current.forEach((item, index) => item?.classList.toggle('is-active', index === current))
      // US-5.14: pictures hang on the left wall for even moments, so the text sits on the right
      // then, tilted toward the picture — and the other way round for odd moments.
      const side = current % 2 === 0 ? 'right' : 'left'
      readingRef.current?.setAttribute('data-side', side)
      shadeRef.current?.setAttribute('data-side', side)
      planeRefs.current.forEach((plane, index) => {
        if (!plane) return
        plane.classList.toggle('is-front', index === current)
        plane.classList.toggle('is-past', index < current)
        plane.classList.toggle('is-next', index > current)
        // Only the neighbours are drawn: the rest costs nothing while hidden.
        plane.style.visibility = Math.abs(index - current) <= 1 ? 'visible' : 'hidden'
      })
      // Direction of the cut (down or up the story), for the transitions.
      world.dataset.direction = previous >= 0 && current < previous ? 'back' : 'forward'
      if (counterRef.current) counterRef.current.textContent = pad(current + 1)
      const hud = hudRef.current
      if (hud) {
        hud.textContent = items[current]?.hud ?? ''
        hud.classList.remove('is-tick')
        void hud.offsetWidth
        hud.classList.add('is-tick')
      }
    }
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`
  })

  return (
    <div
      ref={sectionRef}
      className={cn('photo-flight relative', className)}
      style={{ '--count': count, height: 'calc((var(--count) * var(--flight-per) + 1) * 100vh)' } as CSSProperties}
    >
      {/* Phones: one snap point per moment, where its picture is in front (one swipe = one moment). */}
      {items.map((item, index) => (
        <span
          key={`snap-${item.id}`}
          aria-hidden="true"
          className="flight-snap"
          style={{ top: `calc(var(--count) * var(--flight-per) * 100vh * ${((index + 0.02) / count).toFixed(5)})` }}
        />
      ))}
      <div className="photo-flight-stage sticky top-0 h-dvh overflow-hidden" style={{ perspective: `${PERSPECTIVE}px` }}>
        {/* The corridor of pictures (decorative: the list below carries the same content). */}
        {/* Phones and tablets: the moment's picture is the background of its text, under a
            dark mask; pictures next to the one in front are loaded ahead. */}
        <div aria-hidden="true" className="flight-backdrop absolute inset-0 lg:hidden">
          {items.map((item, index) =>
            item.media && !wide && Math.abs(index - shown) <= 1 ? (
              <img
                key={item.id}
                src={sceneSrc(item.media)}
                alt=""
                decoding="async"
                className={cn('flight-backdrop-image absolute inset-0 size-full object-cover', index === shown && 'is-active')}
              />
            ) : null,
          )}
          {items[shown]?.media && (
            <span className="absolute top-20 left-4">
              <DepictionBadge depiction={items[shown]!.media!.depiction} />
            </span>
          )}
        </div>

        <div ref={worldRef} aria-hidden="true" className="photo-flight-world absolute inset-0 max-lg:hidden">
          {items.map((item, index) => {
            if (!item.media || failed.has(item.id)) return null
            const side = index % 2 === 0 ? -1 : 1
            const style = { '--side': side } as CSSProperties
            return (
              <figure
                key={item.id}
                ref={(element) => {
                  planeRefs.current[index] = element
                }}
                className="photo-flight-plane"
                style={style}
              >
                {/* Long flights (40+ pictures): only the pictures around the one in front are
                    mounted; a far picture frees its canvas and is drawn again when it comes near. */}
                {/* A small copy of the picture shows at once; the large one fades in over it. Only
                    the pictures around the one in front are downloaded: a page of 48 pictures no
                    longer asks for all of them at once on arrival (slow connections lagged). */}
                {near && wide && index >= shown - 2 && index <= shown + LOOK_AHEAD + 3 && (
                  <img src={cardSrc(item.media)} alt="" aria-hidden="true" decoding="async" className="flight-preview absolute inset-0 size-full object-cover" />
                )}
                {near && wide && index >= shown - 1 && index <= shown + LOOK_AHEAD && (
                  <FlightImage url={sceneSrc(item.media)} near onError={() => setFailed((previous) => new Set(previous).add(item.id))} />
                )}
                <span className="absolute top-3 left-3">
                  <DepictionBadge depiction={item.media.depiction} />
                </span>
                {/* US-5.14: the picture in front is framed like a telemetry feed, with its catalogue id. */}
                <HudCorners />
                {item.media.nasaId && <span className="hud-id">{item.media.nasaId}</span>}
              </figure>
            )
          })}
        </div>

        {/* Shade under the reading panel, so the text always reads over the pictures. */}
        <div ref={shadeRef} aria-hidden="true" data-side="right" className="flight-shade pointer-events-none absolute inset-x-0 bottom-0 h-[55%] lg:inset-y-0 lg:h-auto lg:w-[46%]" />

        <div ref={readingRef} data-side="right" className="flight-reading absolute inset-x-0 bottom-0 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-10 lg:inset-y-0 lg:flex lg:items-center lg:pb-0">
          {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events -- the zoom button below is the keyboard way; the whole text is a tap target for convenience (US-5.15) */}
          <div
            className={cn('flight-panel relative max-w-xl rounded-3xl p-5 sm:p-6 lg:max-w-md', items[shown]?.media && 'cursor-zoom-in')}
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a, button, details, summary')) return
              const media = items[shown]?.media
              if (media) setZoom(media)
            }}
          >
            {/* US-5.13: the mission clock, like a telemetry readout, at the head of the panel. */}
            {items.some((item) => item.hud) && (
              <p ref={hudRef} aria-hidden="true" className="flight-hud mb-2 font-mono text-xs tracking-[0.2em] text-world uppercase sm:text-sm">
                {items[0]?.hud}
              </p>
            )}
            <p aria-hidden="true" className="flex items-baseline gap-2 font-mono text-xs tracking-[0.3em] text-world">
              <span ref={counterRef}>01</span>
              <span className="text-moon-dust">/ {pad(count)}</span>
            </p>
            {items[shown]?.media && (
              <button
                type="button"
                onClick={() => setZoom(items[shown]?.media ?? null)}
                aria-label={t('lightbox.open')}
                className="glass-blur absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-full text-starlight transition-colors hover:border-world hover:text-world"
              >
                <ZoomIn aria-hidden="true" className="size-5" />
              </button>
            )}
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
                  {item.media && item.media.depiction !== 'photo' && item.media.depiction !== 'document' && (
                    <span className="mb-2 inline-block lg:hidden">
                      <DepictionBadge depiction={item.media.depiction} />
                    </span>
                  )}
                  {item.content}
                  {item.media && !item.hideCaption && (
                    <MediaFigure
                      media={item.media}
                      lead={t('media.whatYouSee')}
                      withStory={item.withStory ?? true}
                      captionOnly
                      className="mt-3 max-lg:hidden"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <Lightbox media={zoom} onClose={() => setZoom(null)} />
      </div>
    </div>
  )
}

/** Longest side (px) a flying picture is drawn at: plenty for a 720 px card on a 2× screen. */
const MAX_SIDE = 1200

/** Same breakpoint as the `lg:` classes that switch between the two layouts. */
const WIDE = '(min-width: 1024px)'

/**
 * How many large pictures ahead of the one in front are prepared: four, or two when the
 * browser says the connection is slow or the visitor asked to save data.
 */
const LOOK_AHEAD = (() => {
  if (typeof navigator === 'undefined') return 4
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return connection?.saveData || /(^|-)(2g|3g)$/.test(connection?.effectiveType ?? '') ? 2 : 4
})()

/**
 * Pictures are prepared at most three at a time (not one after the other, which left the
 * picture in front waiting behind older ones; not all at once, which froze the page).
 */
const LANES = 3
const lanes: Promise<unknown>[] = Array.from({ length: LANES }, () => Promise.resolve())
let nextLane = 0
function inTurn<T>(task: () => Promise<T>): Promise<T> {
  const lane = nextLane
  nextLane = (nextLane + 1) % LANES
  const run = lanes[lane]!.then(task, task)
  lanes[lane] = run.catch(() => undefined)
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
    return <img src={url} alt="" decoding="async" onError={() => onErrorRef.current()} className="relative size-full object-cover" />
  }
  return (
    <canvas
      ref={canvasRef}
      className={cn('relative size-full object-cover transition-opacity duration-500', mode === 'canvas' ? 'opacity-100' : 'opacity-0')}
    />
  )
}
