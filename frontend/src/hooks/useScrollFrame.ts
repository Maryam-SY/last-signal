import { useEffect, useRef } from 'react'

export interface ScrollFrame {
  scrollY: number
  viewportH: number
  viewportW: number
}

type Listener = (frame: ScrollFrame) => void

/**
 * A single shared scroll/resize listener drives every animation on the page.
 * Callbacks write to DOM nodes/refs directly so scrolling never re-renders React.
 */
const listeners = new Set<Listener>()
let attached = false
let scheduled = false

function emit() {
  scheduled = false
  const frame: ScrollFrame = {
    scrollY: window.scrollY,
    viewportH: window.innerHeight,
    viewportW: window.innerWidth,
  }
  for (const listener of listeners) listener(frame)
}

function schedule() {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(emit)
}

function attach() {
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  attached = true
}

function detach() {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  attached = false
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useScrollFrame(listener: Listener): void {
  const listenerRef = useRef(listener)

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return

    const entry: Listener = (frame) => listenerRef.current(frame)
    listeners.add(entry)
    if (!attached) attach()
    schedule()

    return () => {
      listeners.delete(entry)
      if (listeners.size === 0) detach()
    }
  }, [])
}
