import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Glyphs shown while a letter is still "being received". */
const GLYPHS = 'ABCDEFGHKMNPRSTUVXYZ0123456789#%&<>/'

interface DecodeTextProps {
  text: string
  className?: string
  /** Wait before the decoding starts (ms). */
  delay?: number
  /** Time to resolve the whole text (ms). */
  duration?: number
}

/**
 * A title that resolves letter by letter out of random glyphs, like a message being decoded
 * (US-5.14 art direction). The real text is always there for assistive technology; the
 * animated copy is decorative. Under reduced motion the text is simply shown.
 */
export function DecodeText({ text, className, delay = 150, duration = 1100 }: DecodeTextProps) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState<string | null>(null)

  useEffect(() => {
    if (reduced) return
    const chars = Array.from(text)
    const start = performance.now() + delay
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / duration))
      const resolved = Math.floor(progress * chars.length)
      setShown(
        chars
          .map((char, index) => (index < resolved || /\s/.test(char) ? char : GLYPHS[(index * 7 + Math.floor(now / 45)) % GLYPHS.length]))
          .join(''),
      )
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setShown(text)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text, reduced, delay, duration])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={reduced || shown === text ? undefined : 'decode-live'}>
        {reduced ? text : (shown ?? text.replace(/\S/g, ' '))}
      </span>
    </span>
  )
}
