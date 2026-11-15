import { useEffect, useRef, useState } from 'react'
import { Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import type { Media } from '@/api/types'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { duck } from '@/lib/ambientSound'
import { cn } from '@/lib/utils'
import { DepictionBadge } from './DepictionBadge'

interface VideoReelProps {
  /** NASA video files (mp4). YouTube links are not played here (no third-party embed). */
  videos: readonly Media[]
  label: string
  /** Called when the last video has ended (e.g. to carry the visitor to what comes next). */
  onFinished?: () => void
  className?: string
}

/**
 * The videos of a machine as a reel (US-5.12): each one starts by itself, muted, when the reel
 * comes into view, with what it shows written over the picture; when it ends, the next one
 * follows. Play/pause, sound and "next" stay at hand. Under reduced motion nothing starts by
 * itself.
 */
export function VideoReel({ videos, label, onFinished, className }: VideoReelProps) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const screenRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [inView, setInView] = useState(false)
  const current = videos[index]

  useEffect(() => {
    const screen = screenRef.current
    if (!screen || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? false), { threshold: 0.45 })
    observer.observe(screen)
    return () => observer.disconnect()
  }, [])

  // Starts (muted) when in view, pauses when scrolled away. Browsers allow muted autoplay.
  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return
    if (inView) {
      video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
    }
  }, [inView, index, reduced])

  // The space sound steps back while a video speaks.
  useEffect(() => {
    duck(playing && !muted)
    return () => duck(false)
  }, [playing, muted])

  if (!current) return null

  const next = () => setIndex((value) => (value + 1) % videos.length)
  const onEnded = () => {
    if (index + 1 < videos.length) setIndex(index + 1)
    else {
      setPlaying(false)
      onFinished?.()
    }
  }
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => undefined)
    else video.pause()
  }
  const caption = current.description ?? current.alt

  return (
    <section aria-label={label} className={cn('overflow-hidden rounded-3xl border border-white/10 bg-void', className)}>
      <div ref={screenRef} className="relative aspect-video">
        <video
          key={current.id}
          ref={videoRef}
          src={current.url}
          poster={current.thumbnailUrl ?? undefined}
          muted={muted}
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={onEnded}
          aria-label={current.alt}
          className="size-full bg-void object-cover"
        />
        {/* What the video shows, written on it (works without sound). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/70 to-transparent px-4 pt-16 pb-16 sm:px-8 sm:pb-20">
          <p key={current.id} className="video-caption max-w-3xl text-sm leading-relaxed text-starlight max-sm:mb-14 sm:text-lg">
            {caption}
          </p>
        </div>
        <span className="absolute top-3 left-3">
          <DepictionBadge depiction={current.depiction} />
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-3 sm:px-6 sm:pb-5">
          <button type="button" onClick={togglePlay} className="video-control">
            {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
            <span className="sr-only">{playing ? t('video.pause') : t('video.play')}</span>
          </button>
          <button type="button" aria-pressed={!muted} onClick={() => setMuted((value) => !value)} className="video-control">
            {muted ? <VolumeX aria-hidden="true" className="size-4" /> : <Volume2 aria-hidden="true" className="size-4" />}
            <span className="sr-only">{t('video.sound')}</span>
          </button>
          {videos.length > 1 && (
            <button type="button" onClick={next} className="video-control">
              <SkipForward aria-hidden="true" className="size-4" />
              <span className="sr-only">{t('video.next')}</span>
            </button>
          )}
          <span className="ml-auto font-mono text-xs text-moon-dust" aria-live="polite">
            {t('video.counter', { current: index + 1, total: videos.length })}
          </span>
        </div>
      </div>
      {videos.length > 1 && (
        <ol className="flex gap-1.5 overflow-x-auto px-3 py-3 sm:px-6" aria-label={t('video.list')}>
          {videos.map((video, position) => (
            <li key={video.id}>
              <button
                type="button"
                aria-current={position === index ? 'true' : undefined}
                onClick={() => setIndex(position)}
                className="block min-h-11 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10 text-left text-[0.65rem] leading-tight text-moon-dust transition-colors hover:border-world aria-[current=true]:border-world aria-[current=true]:text-starlight"
              >
                {video.thumbnailUrl && <img src={video.thumbnailUrl} alt="" loading="lazy" className="aspect-video w-full object-cover" />}
                <span className="line-clamp-2 block p-1.5">{video.title ?? video.alt}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
