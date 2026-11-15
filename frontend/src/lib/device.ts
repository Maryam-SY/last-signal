/**
 * Phones and tablets get lighter graphics (team report 2026-11-15: on iPhone, Safari closed the
 * home page — "a problem repeatedly occurred" — because five WebGL scenes with full textures
 * used too much memory; Android coped). Touch screens or narrow windows count as such.
 */
export function liteGraphics(): boolean {
  if (typeof window === 'undefined') return false
  return (window.matchMedia?.('(pointer: coarse)').matches ?? false) || window.innerWidth < 1024
}

/**
 * iPhone and iPad (every browser there runs on Safari's engine). Even the light 3D scenes made
 * Safari close the page after a few seconds (team report 2026-11-15), so these devices get no
 * WebGL at all: the still sky photograph and the photographed planets, which still turn.
 */
export function appleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/** WebGL is available and allowed here (false in tests, very old browsers, iPhone and iPad). */
export function canUseWebGL(): boolean {
  return typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined' && !appleTouchDevice()
}
