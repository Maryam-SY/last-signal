import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

export interface MotionFrame {
  /** Milliseconds since the loop started. */
  time: number
  /** Milliseconds since the previous frame (clamped, so a background tab does not jump). */
  dt: number
  scrollY: number
  /** Smoothed scroll speed in px per 60 fps frame; signed (positive = scrolling down). */
  velocity: number
}

/**
 * Per-frame animation loop for effects that must keep moving after scrolling stops
 * (spin, easing, ripples, warp). Callbacks write to the DOM directly — never React state.
 * Disabled entirely under `prefers-reduced-motion: reduce`.
 */
export function useMotionLoop(callback: (frame: MotionFrame) => void, enabled = true): void {
  const callbackRef = useRef(callback)
  const reduced = useReducedMotion()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled || reduced || typeof window === 'undefined') return

    let frameId = 0
    let start = -1
    let previous = 0
    let lastScroll = window.scrollY
    let velocity = 0

    const tick = (now: number) => {
      if (start < 0) {
        start = now
        previous = now
      }
      const dt = Math.min(now - previous, 64)
      previous = now
      const scrollY = window.scrollY
      const raw = dt > 0 ? ((scrollY - lastScroll) * 16.67) / dt : 0
      lastScroll = scrollY
      velocity += (raw - velocity) * 0.18
      if (Math.abs(velocity) < 0.01) velocity = 0
      callbackRef.current({ time: now - start, dt, scrollY, velocity })
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [enabled, reduced])
}
