/**
 * Shared pieces of the site's synthesised sound (Web Audio API, no audio file): every sound
 * is made of pure tones sent into a long, dark echo — the feeling of a vast empty space. No
 * noise-based effect (team decision 2026-11-15: no "shh" of static, only space).
 */

type AudioContextClass = typeof AudioContext

export function audioContextClass(): AudioContextClass | undefined {
  if (typeof window === 'undefined') return undefined
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext
}

/**
 * A long stereo echo (convolution reverb). Its impulse is a decaying random tail, which is
 * how a large hall answers a sound; it never plays on its own, only colours the tones sent to it.
 */
export function createSpaceEcho(context: BaseAudioContext, destination: AudioNode, seconds = 5, level = 0.55): AudioNode {
  const length = Math.round(context.sampleRate * seconds)
  const impulse = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < 2; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.2)
  }
  const convolver = context.createConvolver()
  convolver.buffer = impulse
  // Dark echo: the high end of the tail is softened.
  const tone = context.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 3200
  const wet = context.createGain()
  wet.gain.value = level
  convolver.connect(tone).connect(wet).connect(destination)
  return convolver
}

/** A pure tone with a soft swell and fade, sent dry to `dry` and into `echo`. */
export function spaceTone(
  context: BaseAudioContext,
  outputs: { dry: AudioNode; echo: AudioNode },
  options: {
    frequency: number
    /** Optional glide to this frequency by the end of the tone. */
    to?: number
    type?: OscillatorType
    start: number
    end: number
    level: number
    attack?: number
    release?: number
    /** Share of the sound sent into the echo (0 to 1). */
    echo?: number
  },
): OscillatorNode {
  const { frequency, to, type = 'sine', start, end, level, attack = 1, release = 1.5, echo = 0.6 } = options
  const oscillator = context.createOscillator()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, end)
  const gain = context.createGain()
  const peak = Math.min(start + attack, end)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(level, peak)
  gain.gain.setValueAtTime(level, Math.max(peak, end - release))
  gain.gain.linearRampToValueAtTime(0, end)
  oscillator.connect(gain)
  const dry = context.createGain()
  dry.gain.value = 1 - echo * 0.5
  gain.connect(dry).connect(outputs.dry)
  const send = context.createGain()
  send.gain.value = echo
  gain.connect(send).connect(outputs.echo)
  oscillator.start(start)
  oscillator.stop(end + 0.05)
  return oscillator
}
