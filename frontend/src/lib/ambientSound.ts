/**
 * The sound of exploring (US-5.12): a slow, deep space drone and a soft "whoosh" between
 * pages, synthesised live with the Web Audio API — no audio file, nothing to license.
 * Browsers only allow sound after a click or a key press, so it starts when the visitor turns
 * it on (sound switch in the header) and fades in gently.
 */

interface Engine {
  context: AudioContext
  master: GainNode
}

let engine: Engine | null = null
let enabled = false

const MAX_VOLUME = 0.22

type AudioContextClass = typeof AudioContext

function audioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.round(context.sampleRate * seconds), context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
  return buffer
}

function createEngine(): Engine | null {
  const Context = audioContextClass()
  if (!Context) return null
  const context = new Context()
  const master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  // Drone: four low voices through a slowly breathing low-pass filter.
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 420
  filter.Q.value = 6
  filter.connect(master)
  const lfo = context.createOscillator()
  const lfoDepth = context.createGain()
  lfo.frequency.value = 0.045
  lfoDepth.gain.value = 260
  lfo.connect(lfoDepth).connect(filter.frequency)
  lfo.start()
  const voices: ReadonlyArray<readonly [number, OscillatorType, number]> = [
    [55, 'sine', 0.5],
    [82.4, 'triangle', 0.18],
    [110.6, 'sine', 0.14],
    [164.8, 'sine', 0.05],
  ]
  for (const [frequency, type, level] of voices) {
    const oscillator = context.createOscillator()
    oscillator.type = type
    oscillator.frequency.value = frequency
    const gain = context.createGain()
    gain.gain.value = level
    oscillator.connect(gain).connect(filter)
    oscillator.start()
  }

  // Cosmic hiss: very soft band-passed noise.
  const noise = context.createBufferSource()
  noise.buffer = noiseBuffer(context, 4)
  noise.loop = true
  const hiss = context.createBiquadFilter()
  hiss.type = 'bandpass'
  hiss.frequency.value = 900
  hiss.Q.value = 0.6
  const hissGain = context.createGain()
  hissGain.gain.value = 0.035
  noise.connect(hiss).connect(hissGain).connect(master)
  noise.start()

  return { context, master }
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

/** A soft rising whoosh, e.g. when the visitor flies to another page. */
export function whoosh(): void {
  if (!enabled || !engine) return
  const { context, master } = engine
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context, 1.4)
  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 1.4
  const gain = context.createGain()
  const now = context.currentTime
  band.frequency.setValueAtTime(220, now)
  band.frequency.exponentialRampToValueAtTime(2400, now + 1.1)
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.5, now + 0.35)
  gain.gain.linearRampToValueAtTime(0, now + 1.3)
  source.connect(band).connect(gain).connect(master)
  source.start(now)
  source.stop(now + 1.4)
}

/** A short burst of radio static, e.g. when a machine's last signal flattens (US-5.14). */
export function crackle(): void {
  if (!enabled || !engine) return
  const { context, master } = engine
  const source = context.createBufferSource()
  source.buffer = noiseBuffer(context, 0.9)
  const band = context.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 0.8
  const gain = context.createGain()
  const now = context.currentTime
  band.frequency.setValueAtTime(1800, now)
  band.frequency.exponentialRampToValueAtTime(400, now + 0.8)
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.4, now + 0.05)
  gain.gain.setValueAtTime(0.4, now + 0.3)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85)
  source.connect(band).connect(gain).connect(master)
  source.start(now)
  source.stop(now + 0.9)
}

