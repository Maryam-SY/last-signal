/** Intro video session state (US-2.4): played once per browser session. */
const SEEN_KEY = 'aeroreborn.intro-seen'
/** Cross-fade from the video's last shot (Moon + Mars) to the live home page. */
export const FADE_MS = 900

/** The intro plays once per visit (browser session), never under reduced motion. */
export function shouldPlayIntro(reducedMotion: boolean): boolean {
  if (reducedMotion) return false
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === null
  } catch {
    return true
  }
}

export function markIntroSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Storage blocked: the intro may play again on the next visit to the home page.
  }
}

/**
 * Whether the intro is on screen. Heavy decorations (the 3D globes: three.js and their maps)
 * wait for it to end, so the intro video gets the phone's connection to itself.
 */
let playing = false
const endListeners = new Set<() => void>()

export function setIntroPlaying(value: boolean): void {
  playing = value
  if (!value) endListeners.forEach((listener) => listener())
}

export function introPlaying(): boolean {
  return playing
}

/** Calls `listener` when the intro ends; returns a function that stops listening. */
export function onIntroEnd(listener: () => void): () => void {
  endListeners.add(listener)
  return () => endListeners.delete(listener)
}

