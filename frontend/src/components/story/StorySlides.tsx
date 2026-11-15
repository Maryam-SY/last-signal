import { useRef } from 'react'
import type { Media, StoryBlock, StoryDetail } from '@/api/types'
import { DepictionBadge } from '@/components/media/DepictionBadge'
import { MediaFigure } from '@/components/media/MediaFigure'
import { VoiceTag } from '@/components/sources/VoiceTag'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useScrollFrame } from '@/hooks/useScrollFrame'
import { cn } from '@/lib/utils'

interface StorySlidesProps {
  story: StoryDetail
  className?: string
}

interface Slide {
  key: string
  stepTitle: string | null
  block: StoryBlock
  media: Media | undefined
}

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (value: number) => 1 - (1 - value) ** 3

/**
 * The machine's story told on its own page (US-5.13), after "its mission, day after day": as
 * many moments as the story has (no fixed number of steps), each one a slide where the text
 * and its picture come in from opposite sides of the screen — text on the left and picture on
 * the right, then the other way round for the next one — and leave the same way. The three
 * narrative voices keep their written label (STORY-007). Under reduced motion: still layout.
 */
export function StorySlides({ story, className }: StorySlidesProps) {
  const mediaById = new Map(story.media.map((item) => [item.id, item]))
  const slides: Slide[] = story.steps.flatMap((step) =>
    step.blocks.map((block, index) => ({
      key: `${step.key}-${index}`,
      stepTitle: index === 0 ? step.title : null,
      block,
      media: (block.mediaIds ?? []).map((id) => mediaById.get(id)).find((item) => item !== undefined),
    })),
  )
  return (
    <ol className={cn('space-y-[12vh] overflow-x-clip', className)}>
      {slides.map((slide, index) => (
        <SlideRow key={slide.key} slide={slide} textLeft={index % 2 === 0} />
      ))}
    </ol>
  )
}

function SlideRow({ slide, textLeft }: { slide: Slide; textLeft: boolean }) {
  const reduced = useReducedMotion()
  const rowRef = useRef<HTMLLIElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const pictureRef = useRef<HTMLDivElement>(null)

  useScrollFrame(({ viewportH }) => {
    if (reduced) return
    const row = rowRef.current
    if (!row) return
    const rect = row.getBoundingClientRect()
    if (rect.bottom < -viewportH * 0.5 || rect.top > viewportH * 1.5) return
    // In: while the row rises from the bottom of the screen to its upper third.
    // Out: while it leaves through the top. Text and picture travel in opposite directions.
    const enter = easeOut(clamp((viewportH - rect.top) / (viewportH * 0.6)))
    const exit = clamp((viewportH * 0.15 - rect.bottom) / (viewportH * 0.45))
    const offset = (1 - enter) + exit
    const side = textLeft ? -1 : 1
    const write = (element: HTMLElement | null, direction: number) => {
      if (!element) return
      element.style.transform = `translate3d(${(direction * offset * 42).toFixed(2)}vw, 0, 0)`
      element.style.opacity = (1 - Math.min(1, offset * 1.15)).toFixed(3)
    }
    write(textRef.current, side)
    write(pictureRef.current, -side)
  })

  const { block, media, stepTitle } = slide
  return (
    <li ref={rowRef} className="relative grid items-center gap-6 overflow-hidden rounded-3xl lg:grid-cols-2 lg:gap-14 lg:overflow-visible lg:rounded-none">
      {/* Phones and tablets (US-5.13): the picture is the background of the text, under a mask. */}
      {media && (
        <div aria-hidden="true" className="slide-backdrop absolute inset-0 lg:hidden">
          <img src={media.url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
          <span className="absolute top-3 right-3">
            <DepictionBadge depiction={media.depiction} />
          </span>
        </div>
      )}
      <div
        ref={textRef}
        className={cn(
          'story-slide relative rounded-3xl p-6 sm:p-8 lg:reading-panel',
          media ? 'max-lg:pt-[42vh]' : 'reading-panel',
          !textLeft && 'lg:order-2',
          !media && 'lg:col-span-2 lg:mx-auto lg:max-w-3xl',
        )}
      >
        {stepTitle && (
          <h3 data-narrate className="mb-4 font-heading text-2xl leading-tight font-bold sm:text-3xl">
            {stepTitle}
          </h3>
        )}
        <VoiceTag voice={block.voice} />
        <p data-narrate className={cn('mt-3 text-lg leading-relaxed sm:text-xl', block.voice === 'imagination' && 'italic')}>
          {block.text}
        </p>
      </div>
      {media && (
        <div ref={pictureRef} className={cn('story-slide max-lg:hidden', !textLeft && 'lg:order-1')}>
          <MediaFigure media={media} className="overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_var(--world-accent)]" />
        </div>
      )}
    </li>
  )
}
