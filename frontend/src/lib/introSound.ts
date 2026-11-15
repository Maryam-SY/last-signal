/**
 * The intro's soundtrack (US-5.13), synthesised live with the Web Audio API — no audio file,
 * nothing to license. It follows the edited NASA footage: the rumble of the Saturn V lift-off,
 * a quiet airy chord on the Moon, the rush of the descent to Mars, then a wide swell under the
 * closing title. Browsers often refuse sound before a click: `start()` then reports it, and the
 * intro offers a button (or any key / tap) to turn it on, picking the score up where the video is.
 */

type AudioContextClass = typeof AudioContext

function audioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.round(context.sampleRate * seconds), context.sampleRate)
  const data = buffer.getChannelData(0)
  // Brown-ish noise: deeper than white noise, closer to a rocket's roar.
  let last = 0
  for (let i = 0; i < data.length; i += 1) {
    last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04
    data[i] = last * 3.2
  }
  return buffer
}

export interface IntroScore {
  /** Tries to play from this second of the video. Resolves false if the browser blocks sound. */
  start: (videoSeconds: number) => Promise<boolean>
  /** The closing title: a wide swell. */
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
  let started = false
  const sources: AudioScheduledSourceNode[] = []

  const ensure = () => {
    if (!context) {
      context = new Context()
      master = context.createGain()
      master.gain.value = 0.9
      master.connect(context.destination)
    }
    return { context, master: master! }
  }

  /** A voice that fades in at `from`, holds, and fades out at `to` (seconds from now). */
  const envelope = (from: number, to: number, level: number, attack = 0.8, release = 1.2) => {
    const { context: ctx, master: out } = ensure()
    const gain = ctx.createGain()
    const t0 = ctx.currentTime + Math.max(0, from)
    const t1 = ctx.currentTime + Math.max(from + attack, to)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(level, t0 + attack)
    gain.gain.setValueAtTime(level, Math.max(t0 + attack, t1 - release))
    gain.gain.linearRampToValueAtTime(0, t1)
    gain.connect(out)
    return { gain, t0, t1 }
  }

  const tone = (frequency: number, type: OscillatorType, from: number, to: number, level: number, attack?: number, release?: number) => {
    const { context: ctx } = ensure()
    const { gain, t0, t1 } = envelope(from, to, level, attack, release)
    const oscillator = ctx.createOscillator()
    oscillator.type = type
    oscillator.frequency.value = frequency
    oscillator.connect(gain)
    oscillator.start(t0)
    oscillator.stop(t1 + 0.05)
    sources.push(oscillator)
    return oscillator
  }

  const noise = (from: number, to: number, level: number, filter: (f: BiquadFilterNode, t0: number, t1: number) => void, attack?: number, release?: number) => {
    const { context: ctx } = ensure()
    const { gain, t0, t1 } = envelope(from, to, level, attack, release)
    const source = ctx.createBufferSource()
    source.buffer = noiseBuffer(ctx, 4)
    source.loop = true
    const band = ctx.createBiquadFilter()
    filter(band, t0, t1)
    source.connect(band).connect(gain)
    source.start(t0)
    source.stop(t1 + 0.05)
    sources.push(source)
  }

  /** Schedules the parts of the score still ahead of `at` (seconds of video). */
  const schedule = (at: number) => {
    const ahead = (range: readonly [number, number]) => range[1] > at
    const rel = (seconds: number) => seconds - at
    if (ahead(LAUNCH)) {
      // Lift-off: a deep roar that swells, with a sub-bass rumble under it.
      noise(rel(LAUNCH[0]), rel(LAUNCH[1]), 0.55, (f, t0, t1) => {
        f.type = 'lowpass'
        f.frequency.setValueAtTime(140, t0)
        f.frequency.linearRampToValueAtTime(620, t0 + (t1 - t0) * 0.6)
        f.frequency.linearRampToValueAtTime(260, t1)
      }, 1.6, 1.4)
      tone(38, 'sine', rel(LAUNCH[0]), rel(LAUNCH[1]), 0.35, 1.4, 1.4)
    }
    if (ahead(MOON)) {
      // The Moon: silence of space, a high, airy open chord.
      for (const [f, l] of [[220, 0.07], [329.6, 0.05], [440, 0.04], [659.3, 0.02]] as const) tone(f, 'sine', rel(MOON[0]), rel(MOON[1]), l, 1.6, 1.6)
    }
    if (ahead(MARS)) {
      // Mars: the rush of the descent, air sweeping down as the ground comes closer.
      noise(rel(MARS[0]), rel(MARS[1]), 0.28, (f, t0, t1) => {
        f.type = 'bandpass'
        f.Q.value = 0.9
        f.frequency.setValueAtTime(2600, t0)
        f.frequency.exponentialRampToValueAtTime(320, t1)
      }, 0.9, 1)
      for (const [f, l] of [[146.8, 0.06], [220, 0.05], [293.7, 0.035]] as const) tone(f, 'triangle', rel(MARS[0]), rel(MARS[1]), l, 1.4, 1.4)
    }
    if (ahead(STILL_THERE)) {
      // "Our machines are still there": a low, patient drone.
      tone(55, 'sine', rel(STILL_THERE[0]), rel(STILL_THERE[1]), 0.18, 1.8, 2)
      tone(82.4, 'triangle', rel(STILL_THERE[0]), rel(STILL_THERE[1]), 0.06, 1.8, 2)
    }
  }

  return {
    async start(videoSeconds) {
      const { context: ctx } = ensure()
      try {
        if (ctx.state === 'suspended') await Promise.race([ctx.resume(), new Promise((resolve) => setTimeout(resolve, 300))])
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
      // The closing title: a soft boom, then a wide chord that blooms and a high shimmer.
      tone(46, 'sine', 0, 2.6, 0.45, 0.04, 2.4)
      for (const [f, l] of [[110, 0.1], [164.8, 0.08], [220, 0.08], [277.2, 0.05], [329.6, 0.05], [440, 0.035]] as const) tone(f, 'sine', 0.1, 4.2, l, 1.4, 1.8)
      for (const [f, l] of [[880, 0.018], [1318.5, 0.012]] as const) tone(f, 'sine', 0.8, 4.2, l, 1.6, 1.6)
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
    },
    playing: () => started && context?.state === 'running',
  }
}
