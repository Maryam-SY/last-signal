import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface CountUpProps {
  value: number
  /** Duration of the count, in ms. */
  duration?: number
  /** Start counting only once this is true (e.g. after the intro). */
  run?: boolean
}

/**
 * A number that counts up from 0 when it first comes into view (decoration on a real value:
 * screen readers and reduced motion get the final value straight away).
 */
export function CountUp({ value, duration = 1400, run = true }: CountUpProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduced || !run) return
    const element = ref.current
    let frame = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      const t = Math.min(1, (now - start) / duration)
      // Ease-out: fast at first, settling on the value.
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    const begin = () => {
      frame = requestAnimationFrame(tick)
    }
    if (!element || typeof IntersectionObserver === 'undefined') {
      // No way to know when it is seen: show the value as is (see below).
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return
      observer.disconnect()
      begin()
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value, duration, reduced, run])

  return (
    <span ref={ref}>
      <span aria-hidden="true">{reduced || typeof IntersectionObserver === 'undefined' ? value : shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
