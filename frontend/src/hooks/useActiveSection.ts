import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-spy: returns the id of the section crossing the middle band of the viewport.
 * Uses IntersectionObserver only (no scroll listener), so it also works under
 * `prefers-reduced-motion` and costs nothing while the page is still.
 * Returns `null` until a section has been seen (and always in environments without IO).
 */
export function useActiveSection(ids: readonly string[], onChange?: (id: string) => void): string | null {
  const [active, setActive] = useState<string | null>(null)
  const onChangeRef = useRef(onChange)
  const key = ids.join('|')

  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Several sections can enter the band in one batch (fast scroll): keep the last one.
        const visible = entries.filter((entry) => entry.isIntersecting)
        const target = visible[visible.length - 1]?.target
        if (!target) return
        setActive(target.id)
        onChangeRef.current?.(target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [key])

  return active
}

/** Scrolls an element into view (smoothly unless reduced motion) and moves focus to it. */
export function scrollToSection(element: HTMLElement | null, reduced: boolean, focusTarget?: HTMLElement | null) {
  if (!element) return
  element.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  const focusable = focusTarget ?? element
  if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1')
  focusable.focus({ preventScroll: true })
}
