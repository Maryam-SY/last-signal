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
