import { Fragment, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface ScatterTextProps {
  text: string
  className?: string
  /**
   * Typewriter (US-2.4): only the first `typed` letters are visible, followed by a caret.
   * Hidden letters keep their place, so the title never reflows while it is being typed.
   */
  typed?: number
}

/** Deterministic pseudo-random in [-1, 1] so letters scatter the same way on every render. */
function noise(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

/**
 * Splits a heading into letters that fly apart as the camera passes through it.
 * Driven only by the inherited CSS variable `--pass` (0 → 1) set by DepthJourney.
 * The whole text stays available to assistive tech via the visually-hidden copy.
 */
export function ScatterText({ text, className, typed }: ScatterTextProps) {
  const typing = typed !== undefined && typed < Array.from(text.replace(/ /g, '')).length
  let letterIndex = 0
  const words = text.split(' ')

  return (
    <span className={cn('velocity-skew inline-block', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wordIndex) => (
          <Fragment key={`${word}-${wordIndex}`}>
          {wordIndex > 0 && ' '}
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((letter) => {
              letterIndex += 1
              const seed = letterIndex
              const hidden = typed !== undefined && seed > typed
              const caret = typing && seed === typed
              return (
                <span
                  key={seed}
                  className={cn('scatter-letter', hidden && 'invisible', caret && 'typing-caret')}
                  style={
                    {
                      '--sx': (noise(seed) * 260).toFixed(0),
                      '--sy': (noise(seed + 31) * 180).toFixed(0),
                      '--sr': (noise(seed + 77) * 70).toFixed(0),
                    } as CSSProperties
                  }
                >
                  {letter}
                </span>
              )
            })}
          </span>
          </Fragment>
        ))}
      </span>
    </span>
  )
}
