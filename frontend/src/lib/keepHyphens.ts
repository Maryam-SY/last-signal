/**
 * Joins the parts of a hyphenated name ("MER-A", "MER-B") with a non-breaking hyphen, which
 * looks the same, so a narrow screen never breaks it into "MER-" / "A" (team report: the
 * title "Meet Spirit (MER-A)" broke on the hyphen on phones). For display only.
 */
export function keepHyphens(text: string): string {
  return text.replace(/(\w)-(\w)/g, '$1‑$2')
}
