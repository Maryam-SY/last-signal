/**
 * The sound of exploring (US-5.12): a slow, deep space drone with faint distant shimmers, and a
 * soft rising glide between pages — pure tones in a long echo, synthesised live with the Web
 * Audio API (no audio file, nothing to license, no noise: lib/spaceAudio). Browsers only allow
 * sound after a click or a key press, so it starts when the visitor turns it on (sound switch
 * in the header) and fades in gently.
 */
import { audioContextClass, createSpaceEcho, spaceTone } from './spaceAudio'

interface Engine {
  context: AudioContext
  master: GainNode
  echo: AudioNode
}

let engine: Engine | null = null
let enabled = false

const MAX_VOLUME = 0.22

/** A tone that never stops, its loudness slowly breathing (one breath every `period` seconds). */
function breathingTone(context: AudioContext, out: AudioNode, frequency: number, type: OscillatorType, level: number, period: number, detune = 0) {
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.value = frequency
  oscillator.detune.value = detune
  const gain = context.createGain()
  gain.gain.value = level
  const lfo = context.createOscillator()
  lfo.frequency.value = 1 / period
  const depth = context.createGain()
  depth.gain.value = level * 0.9
  lfo.connect(depth).connect(gain.gain)
  oscillator.connect(gain).connect(out)
  oscillator.start()
  lfo.start()
}

function createEngine(): Engine | null {
  const Context = audioContextClass()
  if (!Context) return null
  const context = new Context()
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)
  const echo = createSpaceEcho(context, master, 6, 0.7)

  // Drone: low voices, each doubled slightly out of tune so they slowly beat, through a
  // breathing low-pass filter.
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 380
  filter.Q.value = 4
  filter.connect(master)
  filter.connect(echo)
  const lfo = context.createOscillator()
  const lfoDepth = context.createGain()
  lfo.frequency.value = 0.035
  lfoDepth.gain.value = 220
  lfo.connect(lfoDepth).connect(filter.frequency)
  lfo.start()
  const voices: ReadonlyArray<readonly [number, OscillatorType, number, number]> = [
    [55, 'sine', 0.42, 23],
    [55, 'sine', 0.3, 31],
    [82.4, 'triangle', 0.12, 19],
    [110, 'sine', 0.1, 27],
    [164.8, 'sine', 0.04, 17],
  ]
  voices.forEach(([frequency, type, level, period], index) => breathingTone(context, filter, frequency, type, level, period, index % 2 ? 7 : -5))

  // Distant shimmers: faint high tones fading in and out at their own pace, mostly echo.
  const shimmer = context.createGain()
  shimmer.gain.value = 0.25
  shimmer.connect(echo)
  const stars: ReadonlyArray<readonly [number, number]> = [
    [880, 13],
    [1318.5, 17],
    [1760, 11],
    [2217.5, 19],
  ]
  for (const [frequency, period] of stars) breathingTone(context, shimmer, frequency, 'sine', 0.05, period)

  return { context, master, echo }
}

function fadeTo(volume: number, seconds: number) {
  if (!engine) return
  const { context, master } = engine
  const now = context.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(volume, now + seconds)
}

export function isSoundAvailable(): boolean {
  return audioContextClass() !== undefined
}

/** Must be called from a click or key handler (browser autoplay rules). */
export async function setSound(on: boolean): Promise<void> {
  enabled = on
  if (on) {
    engine ??= createEngine()
    if (!engine) return
    if (engine.context.state === 'suspended') await engine.context.resume()
    fadeTo(MAX_VOLUME, 2.5)
  } else {
    fadeTo(0, 0.8)
    // Once silent, suspend the whole graph: no oscillator keeps running for nothing.
    const current = engine
    window.setTimeout(() => {
      if (!enabled && current && current.context.state === 'running') void current.context.suspend().catch(() => undefined)
    }, 900)
  }
}

/** Lowers the drone while a voice speaks (narration, videos), then brings it back. */
export function duck(active: boolean): void {
  if (!enabled) return
  fadeTo(active ? MAX_VOLUME * 0.3 : MAX_VOLUME, 0.6)
}

/** A soft rising glide (two tones sliding up an octave), e.g. when the visitor flies to another page. */
export function glide(): void {
  if (!enabled || !engine) return
  const { context, master, echo } = engine
  const now = context.currentTime
  for (const [from, level] of [[220, 0.16], [329.6, 0.1]] as const) {
    spaceTone(context, { dry: master, echo }, { frequency: from, to: from * 2, start: now, end: now + 1.4, level, attack: 0.5, release: 0.8, echo: 0.8 })
  }
}

/** A machine's last signal fades: two soft pings, the second lower and fainter, lost in the echo (US-5.14). */
export function signalFade(): void {
  if (!enabled || !engine) return
  const { context, master, echo } = engine
  const now = context.currentTime
  for (const [delay, frequency, level] of [[0, 880, 0.2], [0.55, 659.3, 0.12]] as const) {
    spaceTone(context, { dry: master, echo }, { frequency, start: now + delay, end: now + delay + 1.6, level, attack: 0.01, release: 1.55, echo: 0.9 })
  }
}
