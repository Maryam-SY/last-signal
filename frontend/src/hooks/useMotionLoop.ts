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

type Subscriber = (frame: MotionFrame) => void

/**
 * One rAF loop for the whole page. Every animated component subscribes here instead of
 * starting its own loop, so scroll position and velocity are read once per frame and the
 * browser only has one animation callback to schedule.
 */
const subscribers = new Set<Subscriber>()
let frameId = 0
let started = 0
let previous = 0
let lastScroll = 0
let velocity = 0

function tick(now: number) {
  if (started === 0) {
    started = now
    previous = now
    lastScroll = window.scrollY
  }
  const dt = Math.min(now - previous, 64)
  previous = now
  const scrollY = window.scrollY
  const raw = dt > 0 ? ((scrollY - lastScroll) * 16.67) / dt : 0
  lastScroll = scrollY
  velocity += (raw - velocity) * 0.18
  if (Math.abs(velocity) < 0.01) velocity = 0

  const frame = { time: now - started, dt, scrollY, velocity }
  for (const subscriber of subscribers) subscriber(frame)
  frameId = requestAnimationFrame(tick)
}

function start() {
  if (frameId !== 0) return
  started = 0
  velocity = 0
  frameId = requestAnimationFrame(tick)
}

function stop() {
  cancelAnimationFrame(frameId)
  frameId = 0
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

    const subscriber: Subscriber = (frame) => callbackRef.current(frame)
    subscribers.add(subscriber)
    start()

    return () => {
      subscribers.delete(subscriber)
      if (subscribers.size === 0) stop()
    }
  }, [enabled, reduced])
}
