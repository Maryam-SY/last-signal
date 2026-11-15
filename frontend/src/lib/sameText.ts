/**
 * True when two texts say the same thing, ignoring case, spaces and punctuation (US-5.13):
 * used to never show a picture's caption twice ("What you see: …" right after the same text).
 */
export function sameText(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  const norm = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
  return norm(a) === norm(b)
}
