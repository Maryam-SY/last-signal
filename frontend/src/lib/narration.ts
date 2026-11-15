/**
 * Story narration with the browser's own speech synthesis (US-5.12, team decision: browser
 * voice now, recorded voices later). Nothing is sent anywhere; no speech synthesis → no button.
 */

export function canNarrate(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
}

/** Best installed voice for a language ("fr", "en"…): a natural/online one first. */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith(lang))
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

/** Reads the paragraphs one after the other. Returns a function that stops the narration. */
export function narrate(paragraphs: readonly string[], lang: string, handlers: NarrationHandlers = {}): () => void {
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
    const voice = pickVoice(lang)
    if (voice) utterance.voice = voice
    utterance.rate = 0.98
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
