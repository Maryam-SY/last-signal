/**
 * Story narration with the browser's own speech synthesis (US-5.12, team decision: browser
 * voice now, recorded voices later). Nothing is sent anywhere; no speech synthesis → no button.
 */

export function canNarrate(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Low male voices shipped by common browsers and systems (Edge/Windows, Chrome, macOS). */
const DEEP_VOICES = /(guy|christopher|eric|davis|andrew|brian|roger|steffan|tony|ryan|thomas|henri|paul|claude|remy|rémy|jerome|jérôme|gérard|daniel|male)/i

/** Best installed voice for a language ("fr", "en"…): a natural/online one first. */
function pickVoice(lang: string, deep = false): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith(lang))
  const natural = (voice: SpeechSynthesisVoice) => /natural|neural|online|google/i.test(voice.name)
  if (deep) {
    const low = voices.find((voice) => DEEP_VOICES.test(voice.name) && natural(voice)) ?? voices.find((voice) => DEEP_VOICES.test(voice.name))
    if (low) return low
  }
  return (
    voices.find((voice) => /natural|neural|online|google/i.test(voice.name)) ??
    voices.find((voice) => voice.localService) ??
    voices[0]
  )
}

export interface NarrationHandlers {
  /** Index of the paragraph being read (to show or scroll to it). */
  onParagraph?: (index: number) => void
  /** A word starts being spoken: its position in the paragraph's text (where the voice says so). */
  onWord?: (index: number, charIndex: number, charLength?: number) => void
  onEnd?: () => void
}

export interface NarrationVoice {
  /** A low male voice when one is installed, said lower and slower (the intro's narrator). */
  deep?: boolean
}

/** Reads the paragraphs one after the other. Returns a function that stops the narration. */
export function narrate(
  paragraphs: readonly string[],
  lang: string,
  handlers: NarrationHandlers = {},
  { deep = false }: NarrationVoice = {},
): () => void {
  if (!canNarrate()) return () => {}
  const synth = window.speechSynthesis
  synth.cancel()
  let stopped = false
  // Indices stay those of `paragraphs` (empty ones are skipped), so callers can map them back.
  const texts = paragraphs

  const speak = (index: number) => {
    if (stopped) return
    if (index >= texts.length) {
      handlers.onEnd?.()
      return
    }
    const text = texts[index] ?? ''
    if (!text.trim()) {
      speak(index + 1)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    const voice = pickVoice(lang, deep)
    if (voice) utterance.voice = voice
    utterance.rate = deep ? 0.8 : 0.98
    utterance.pitch = deep ? 0.55 : 1
    utterance.onstart = () => handlers.onParagraph?.(index)
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === undefined) handlers.onWord?.(index, event.charIndex, event.charLength || undefined)
    }
    utterance.onend = () => speak(index + 1)
    utterance.onerror = () => speak(index + 1)
    synth.speak(utterance)
  }
  speak(0)

  return () => {
    stopped = true
    synth.cancel()
  }
}
