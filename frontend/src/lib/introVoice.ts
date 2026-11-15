/**
 * The intro's narration clips (team decision 2026-11-15): one short MP3 per sentence, said by
 * a deep narrator voice — generated with a text-to-speech service such as Fish Audio, or
 * recorded; never a clone of a real person. Files: intro-<locale>-<1..4|finale>.mp3. Clips live
 * in public/media/voice/; a clip that is missing or unreadable makes the caller fall back to
 * the synthetic voice, so the intro works before the recordings exist.
 */

/** The sentences of the intro: the four cues over the footage, then the closing title. */
export type IntroLine = 1 | 2 | 3 | 4 | 'finale'

export function introVoiceUrl(locale: string, line: IntroLine): string {
  return `/media/voice/intro-${locale}-${line}.mp3`
}

/** Clips already known to be missing: not requested again during the visit. */
const unavailable = new Set<string>()

/**
 * Plays the recorded clip of a line. Calls `onUnavailable` (at most once) when there is no
 * usable recording. Returns a function that stops the clip.
 */
export function playIntroLine(locale: string, line: IntroLine, onUnavailable: () => void = () => {}): () => void {
  const url = introVoiceUrl(locale, line)
  let stopped = false
  let fellBack = false
  const fallBack = () => {
    unavailable.add(url)
    if (stopped || fellBack) return
    fellBack = true
    onUnavailable()
  }
  if (unavailable.has(url) || typeof Audio === 'undefined') {
    fallBack()
    return () => {
      stopped = true
    }
  }

  const audio = new Audio(url)
  // A missing file comes back as the site's HTML page: the browser cannot decode it.
  audio.addEventListener('error', fallBack, { once: true })
  try {
    const playing = audio.play() as Promise<void> | undefined
    if (playing && typeof playing.catch === 'function') {
      playing.catch((error: unknown) => {
        if ((error as { name?: string } | null)?.name !== 'AbortError') fallBack()
      })
    } else fallBack()
  } catch {
    fallBack()
  }

  return () => {
    stopped = true
    audio.removeEventListener('error', fallBack)
    audio.pause()
  }
}
