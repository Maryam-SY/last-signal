import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { AlertTriangle, ChevronsDown } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { ApiError, api } from '@/api/client'
import type { StoryDetail } from '@/api/types'
import { paths } from '@/app/paths'
import { SpaceBackdrop } from '@/components/celestial/SpaceBackdrop'
import { LoadState } from '@/components/common/LoadState'
import { ScrollProgress } from '@/components/motion/ScrollProgress'
import { StepRail } from '@/components/story/StepRail'
import { StepScene } from '@/components/story/StepScene'
import { STEP_ACCENT, stepSectionId } from '@/components/story/storySteps'
import { StoryControls } from '@/components/story/StoryControls'
import { StoryEnd } from '@/components/story/StoryEnd'
import { useActiveSection, scrollToSection } from '@/hooks/useActiveSection'
import { useApi } from '@/hooks/useApi'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useTranslation } from '@/i18n'
import { ctaGhost, ctaPrimary, eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

/**
 * STORY-001 → 009: a six-step story told as one continuous scroll (US-5.6). Each step is a
 * full-screen scene; the step in view is written to the URL (?step=1..6), and the rail,
 * Previous / Next and the ← → keys jump between steps, so progress never depends on
 * scrolling alone.
 */
export function StoryPage() {
  const { storyId = '' } = useParams()
  const { t } = useTranslation()
  const story = useApi(`story:${storyId}`, (lang, signal) => api.story(storyId, lang, signal))
  useDocumentTitle(story.status === 'success' ? story.data.title : t('story.title'))

  if (story.status === 'error' && story.error instanceof ApiError && story.error.status === 404) {
    return (
      <StoryShell>
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">{t('story.title')}</h1>
        <p className="mt-4 text-moon-dust">{t('story.unavailable', { storyId })}</p>
        <Link to={paths.home()} className={cn(ctaGhost, 'mt-8')}>
          {t('story.exit')}
        </Link>
      </StoryShell>
    )
  }

  if (story.status !== 'success') {
    return (
      <StoryShell>
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">{t('story.title')}</h1>
        <LoadState status={story.status} onRetry={story.retry} className="mt-6" />
      </StoryShell>
    )
  }

  return <StoryExperience story={story.data} />
}

function StoryShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <SpaceBackdrop />
      <div className="relative z-10 mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center px-5 py-16">{children}</div>
    </div>
  )
}

/** Keys that must keep their native meaning (typing, media seeking, menus). */
function ownsArrowKeys(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'VIDEO', 'AUDIO'].includes(target.tagName)
}

function StoryExperience({ story }: { story: StoryDetail }) {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const total = story.steps.length
  const requested = Number(params.get('step'))
  const current = Number.isInteger(requested) && requested >= 1 && requested <= total ? requested : 1
  const step = story.steps[current - 1]!
  const from = params.get('from')

  const headingRefs = useRef<Array<HTMLHeadingElement | null>>([])
  const firstRender = useRef(true)
  /** Step the URL was just set to because the visitor scrolled there (no scroll back). */
  const fromScroll = useRef<number | null>(null)
  /** While a jump is scrolling to this step, ignore the steps crossed on the way. */
  const jumpTarget = useRef<number | null>(null)
  const jumpTimer = useRef<number | undefined>(undefined)

  const setStepParam = (n: number, replace: boolean) => {
    const next = new URLSearchParams(params)
    next.set('step', String(n))
    setParams(next, { replace, preventScrollReset: true })
  }

  // Scroll → URL: the step crossing the middle of the screen becomes the current step.
  // `replace`, so scrolling does not flood the history; jumps below push an entry.
  useActiveSection(
    story.steps.map((_, index) => stepSectionId(index + 1)),
    (id) => {
      const n = Number(id.slice('step-'.length))
      if (jumpTarget.current !== null) {
        if (n !== jumpTarget.current) return
        jumpTarget.current = null
      }
      if (n === current) return
      fromScroll.current = n
      setStepParam(n, true)
    },
  )

  // URL → scroll: a jump (rail, buttons, keys, back/forward) brings its scene into view and
  // moves focus to its title for keyboard and screen-reader users.
  useEffect(() => {
    const section = document.getElementById(stepSectionId(current))
    if (firstRender.current) {
      firstRender.current = false
      if (current > 1) section?.scrollIntoView?.({ block: 'start' })
      return
    }
    if (fromScroll.current === current) {
      fromScroll.current = null
      return
    }
    jumpTarget.current = current
    window.clearTimeout(jumpTimer.current)
    jumpTimer.current = window.setTimeout(() => {
      jumpTarget.current = null
    }, 1500)
    scrollToSection(section, reduced, headingRefs.current[current - 1])
  }, [current, reduced])

  useEffect(() => () => window.clearTimeout(jumpTimer.current), [])

  const goTo = (n: number) => {
    if (n < 1 || n > total) return
    if (n === current) {
      scrollToSection(document.getElementById(stepSectionId(n)), reduced, headingRefs.current[n - 1])
      return
    }
    setStepParam(n, false) // push: the browser back button returns to the previous step
  }

  // ← / → change step, unless the focused element needs the arrows itself.
  const goToRef = useRef(goTo)
  const currentRef = useRef(current)
  useEffect(() => {
    goToRef.current = goTo
    currentRef.current = current
  })
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (ownsArrowKeys(event.target)) return
      if (event.key === 'ArrowRight') goToRef.current(currentRef.current + 1)
      else if (event.key === 'ArrowLeft') goToRef.current(currentRef.current - 1)
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const destinationId = story.destinationId
  const exitHref = destinationId
    ? `${paths.destination(destinationId)}${from ? `#machine-${encodeURIComponent(from)}` : '#missions-title'}`
    : paths.home()
  const mediaById = new Map(story.media.map((m) => [m.id, m]))
  const sourceById = new Map(story.sources.map((s) => [s.id, s]))
  const ambient = { '--step-accent': STEP_ACCENT[step.key] } as CSSProperties

  return (
    <article data-world={destinationId ?? undefined} style={ambient} className="relative">
      <SpaceBackdrop />
      <ScrollProgress />
      <StepRail steps={story.steps} current={current} onSelect={goTo} />

      <div className="relative z-10 mx-auto max-w-3xl px-5 pb-32">
        <header className="flex min-h-[calc(100dvh-4rem)] flex-col justify-center pt-20 pb-10 xl:pt-10">
          <p className={cn(eyebrow, 'text-world')}>{story.missions.map((m) => m.name).join(' · ')}</p>
          <h1 className="text-glow mt-3 font-heading text-5xl leading-[0.95] font-bold sm:text-7xl">{story.title}</h1>

          {story.status === 'draft' && (
            <p className="glass mt-8 flex items-start gap-3 rounded-2xl border-stellar-gold/40 p-4 text-sm">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-stellar-gold" />
              {t('story.draftNotice')}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => goTo(1)} className={cn(ctaPrimary, 'group')}>
              {t('story.begin')}
              <ChevronsDown aria-hidden="true" className="size-4 transition-transform group-hover:translate-y-0.5" />
            </button>
            <p className="hidden text-sm text-moon-dust lg:block">{t('story.keyboardHint')}</p>
          </div>
          <p aria-hidden="true" className={cn(eyebrow, 'mt-16 flex items-center gap-2 text-moon-dust/80')}>
            <ChevronsDown className="size-4 motion-safe:animate-bounce" />
            {t('story.scrollHint')}
          </p>
        </header>

        {story.steps.map((s, index) => (
          <StepScene
            key={s.key}
            step={s}
            number={index + 1}
            total={total}
            headingRef={(element) => {
              headingRefs.current[index] = element
            }}
            mediaById={mediaById}
            sourceById={sourceById}
            relations={s.key === 'relay' && s.relationIds ? story.relations.filter((r) => s.relationIds!.includes(r.id)) : []}
          />
        ))}

        <StoryEnd destinationId={destinationId} exitHref={exitHref} />
      </div>

      <StoryControls current={current} total={total} stepTitle={step.title} exitHref={exitHref} onGo={goTo} />
    </article>
  )
}
