/**
 * The intro's soundtrack (US-5.13), synthesised live with the Web Audio API — no audio file,
 * nothing to license, and no noise: only deep tones and faint shimmers in a long echo, the
 * sound of space (lib/spaceAudio, team decision 2026-11-15). It follows the edited NASA
 * footage: a deep swell for the lift-off, an open, airy chord on the Moon, a slow descending
 * glide down to Mars, a patient low drone, then a wide bloom under the closing title. Browsers
 * only play sound after a click, a tap or a key: `start()` reports when it is refused, and the
 * intro then offers a button (any click, tap or key also works), picking the score up where
 * the video is.
 */
import { audioContextClass, createSpaceEcho, spaceTone } from './spaceAudio'

export interface IntroScore {
  /** Tries to play from this second of the video. Resolves false if the browser blocks sound. */
  start: (videoSeconds: number) => Promise<boolean>
  /** The closing title: a wide bloom. */
  finale: () => void
  /** Fades everything out and releases the audio device. */
  stop: (fadeSeconds?: number) => void
  playing: () => boolean
}

/** Moments of the edited footage (public/media/intro-nasa.mp4), in seconds. */
const LAUNCH = [0, 5.2] as const
const MOON = [4.6, 9.4] as const
const MARS = [8.6, 12.6] as const
const STILL_THERE = [12.0, 16.5] as const

export function createIntroScore(): IntroScore | null {
  const Context = audioContextClass()
  if (!Context) return null
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let echo: AudioNode | null = null
  let started = false
  const sources: AudioScheduledSourceNode[] = []

  const ensure = () => {
    if (!context) {
      context = new Context()
      master = context.createGain()
      master.gain.value = 0.9
      master.connect(context.destination)
      echo = createSpaceEcho(context, master, 6, 0.75)
    }
    return { context, master: master!, echo: echo! }
  }

  /** A tone `from`…`to` seconds from now (optionally gliding to another pitch). */
  const tone = (frequency: number, from: number, to: number, level: number, options: { attack?: number; release?: number; glideTo?: number; type?: OscillatorType; echo?: number } = {}) => {
    const { context: ctx, master: dry, echo: wet } = ensure()
    const now = ctx.currentTime
    sources.push(
      spaceTone(ctx, { dry, echo: wet }, {
        frequency,
        to: options.glideTo,
        type: options.type,
        start: now + Math.max(0, from),
        end: now + Math.max(from + (options.attack ?? 1) + 0.1, to),
        level,
        attack: options.attack,
        release: options.release,
        echo: options.echo,
      }),
    )
  }

  /** Schedules the parts of the score still ahead of `at` (seconds of video). */
  const schedule = (at: number) => {
    const ahead = (range: readonly [number, number]) => range[1] > at
    const rel = (seconds: number) => seconds - at
    if (ahead(LAUNCH)) {
      // Lift-off: a deep swell rising from below, with a slow fifth above it.
      tone(36.7, rel(LAUNCH[0]), rel(LAUNCH[1]), 0.4, { attack: 2.2, release: 1.6, glideTo: 55, echo: 0.3 })
      tone(55, rel(LAUNCH[0] + 0.6), rel(LAUNCH[1]), 0.16, { attack: 2, release: 1.6, glideTo: 82.4, type: 'triangle', echo: 0.5 })
      tone(110, rel(LAUNCH[0] + 1.8), rel(LAUNCH[1]), 0.05, { attack: 2, release: 1.4, echo: 0.8 })
    }
    if (ahead(MOON)) {
      // The Moon: an open, airy chord and faint shimmers, far away in the echo.
      for (const [f, l] of [[220, 0.07], [329.6, 0.055], [440, 0.04], [659.3, 0.025]] as const) tone(f, rel(MOON[0]), rel(MOON[1]), l, { attack: 1.8, release: 1.8, echo: 0.75 })
      for (const [f, l, d] of [[1318.5, 0.018, 0.6], [1760, 0.014, 1.6], [2637, 0.009, 2.6]] as const) tone(f, rel(MOON[0] + d), rel(MOON[1]), l, { attack: 1.4, release: 1.6, echo: 0.95 })
    }
    if (ahead(MARS)) {
      // Mars: the descent, a slow chord gliding down as the ground comes closer.
      for (const [f, l] of [[293.7, 0.06], [440, 0.045], [587.3, 0.03]] as const) tone(f, rel(MARS[0]), rel(MARS[1]), l, { attack: 1.2, release: 1.4, glideTo: f * 0.75, type: 'triangle', echo: 0.7 })
      tone(73.4, rel(MARS[0]), rel(MARS[1]), 0.12, { attack: 1.4, release: 1.4, echo: 0.4 })
    }
    if (ahead(STILL_THERE)) {
      // "Our machines are still there": a low, patient drone.
      tone(55, rel(STILL_THERE[0]), rel(STILL_THERE[1]), 0.18, { attack: 1.8, release: 2, echo: 0.5 })
      tone(82.4, rel(STILL_THERE[0]), rel(STILL_THERE[1]), 0.06, { attack: 1.8, release: 2, type: 'triangle', echo: 0.6 })
      tone(880, rel(STILL_THERE[0] + 1), rel(STILL_THERE[1]), 0.012, { attack: 1.6, release: 1.8, echo: 0.95 })
    }
  }

  return {
    async start(videoSeconds) {
      const { context: ctx } = ensure()
      try {
        // resume() is called at once (inside the click or key handler, as browsers require).
        if (ctx.state === 'suspended') await Promise.race([ctx.resume(), new Promise((resolve) => setTimeout(resolve, 1200))])
      } catch {
        return false
      }
      if (ctx.state !== 'running') return false
      if (!started) {
        started = true
        schedule(videoSeconds)
      }
      return true
    },
    finale() {
      if (!started || !context) return
      // The closing title: a deep bloom, a wide chord opening, and high shimmers in the echo.
      tone(41.2, 0, 3.6, 0.42, { attack: 0.05, release: 3.2, glideTo: 36.7, echo: 0.5 })
      for (const [f, l] of [[110, 0.09], [164.8, 0.07], [220, 0.07], [277.2, 0.045], [329.6, 0.045], [440, 0.03]] as const) tone(f, 0.1, 4.2, l, { attack: 1.4, release: 1.8, echo: 0.7 })
      for (const [f, l] of [[880, 0.016], [1318.5, 0.011], [1760, 0.008]] as const) tone(f, 0.8, 4.2, l, { attack: 1.6, release: 1.6, echo: 0.95 })
    },
    stop(fadeSeconds = 0.9) {
      const ctx = context
      if (!ctx || !master) return
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + fadeSeconds)
      window.setTimeout(() => {
        sources.forEach((source) => {
          try {
            source.stop()
          } catch {
            // Already stopped.
          }
        })
        void ctx.close().catch(() => undefined)
      }, fadeSeconds * 1000 + 100)
      context = null
      master = null
      echo = null
    },
    playing: () => started && context?.state === 'running',
  }
}
