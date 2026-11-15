/**
 * Phones and tablets get lighter graphics (team report 2026-11-15: on iPhone, Safari closed the
 * home page — "a problem repeatedly occurred" — because five WebGL scenes with full textures
 * used too much memory; Android coped). Touch screens or narrow windows count as such.
 */
export function liteGraphics(): boolean {
  if (typeof window === 'undefined') return false
  return (window.matchMedia?.('(pointer: coarse)').matches ?? false) || window.innerWidth < 1024
}
