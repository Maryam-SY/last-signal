import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, summary, label, model-viewer'

/**
 * A thin ring that follows the pointer with a little lag and opens up over anything you can
 * click (US-5.14 art direction). The native cursor stays: the ring is only a feel, never the
 * only cue. Mouse/trackpad screens only; none on touch screens or under reduced motion. The
 * animation frame loop runs only while the ring is still catching up with the pointer.
 */
export function CursorRing() {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [fine, setFine] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setFine(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const ring = ref.current
    if (!fine || reduced || !ring) return
    let x = -100
    let y = -100
    let targetX = -100
    let targetY = -100
    let active = false
    let frame = 0
    let running = false

    const tick = () => {
      x += (targetX - x) * 0.22
      y += (targetY - y) * 0.22
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${active ? 1.9 : 1})`
      if (Math.abs(targetX - x) > 0.3 || Math.abs(targetY - y) > 0.3) frame = requestAnimationFrame(tick)
      else running = false
    }
    const wake = () => {
      if (running) return
      running = true
      frame = requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return
      if (targetX === -100) {
        x = event.clientX
        y = event.clientY
      }
      targetX = event.clientX
      targetY = event.clientY
      const target = event.target as Element | null
      active = Boolean(target?.closest?.(INTERACTIVE))
      ring.classList.toggle('is-active', active)
      ring.style.opacity = '1'
      wake()
    }
    const onLeave = () => {
      ring.style.opacity = '0'
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [fine, reduced])

  if (!fine || reduced) return null
  return <div ref={ref} aria-hidden="true" className="cursor-ring" />
}
