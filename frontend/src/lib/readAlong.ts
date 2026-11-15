/**
 * Read-along for the narration (US-5.12): the page follows the voice. Each piece of text the
 * narration reads is marked `data-narrate` in the page; while it is read, it is highlighted
 * (`data-narrating`), the word being spoken is marked with the CSS Custom Highlight API (no
 * change to the DOM; skipped where the browser lacks it), and the page scrolls to keep it in
 * view. Parts of the page that are not laid out in normal flow (the 3D photo flight) register
 * their own way of being brought into view.
 */

/** Text pieces read aloud, in page order. `data-narrate-text="…"` gives a spoken text of its own. */
export interface ReadAlongPart {
  element: HTMLElement
  text: string
  /** True when `text` is exactly the element's text, so words can be highlighted in place. */
  inPlace: boolean
}

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim()

/** The pieces of `root` to read: visible, not decorative, with some text. */
export function readAlongParts(root: ParentNode): ReadAlongPart[] {
  const parts: ReadAlongPart[] = []
  for (const element of root.querySelectorAll<HTMLElement>('[data-narrate]')) {
    if (element.closest('[aria-hidden="true"]')) continue
    const spoken = element.dataset.narrateText?.trim()
    const text = spoken || element.textContent || ''
    if (!collapse(text)) continue
    parts.push({ element, text: spoken ? spoken : text, inPlace: !spoken })
  }
  return parts
}

type Bringer = (behavior: ScrollBehavior) => void
const bringers = new WeakMap<Element, Bringer>()

/** Lets a part of the page say how to scroll to it (returns the function that unregisters it). */
export function setBringIntoView(element: Element, bring: Bringer): () => void {
  bringers.set(element, bring)
  return () => {
    if (bringers.get(element) === bring) bringers.delete(element)
  }
}

/** Scrolls so `element` sits in the middle band of the screen (no move if it already does). */
export function bringIntoView(element: HTMLElement, reduced: boolean) {
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth'
  for (let node: Element | null = element; node; node = node.parentElement) {
    const bring = bringers.get(node)
    if (bring) {
      bring(behavior)
      return
    }
  }
  const rect = element.getBoundingClientRect()
  const viewportH = window.innerHeight || document.documentElement.clientHeight
  const comfortable = rect.top >= viewportH * 0.18 && rect.bottom <= viewportH * 0.78
  if (comfortable) return
  // Long texts: their top just under the header; short ones: centred.
  const top = rect.height > viewportH * 0.55 ? rect.top - viewportH * 0.2 : rect.top + rect.height / 2 - viewportH * 0.45
  window.scrollTo({ top: window.scrollY + top, behavior })
}

const WORD_HIGHLIGHT = 'narration-word'

interface HighlightRegistry {
  set: (name: string, highlight: unknown) => void
  delete: (name: string) => void
}
type HighlightConstructor = new (...ranges: Range[]) => unknown

function highlightApi(): { registry: HighlightRegistry; Highlight: HighlightConstructor } | null {
  const css = (globalThis as { CSS?: { highlights?: HighlightRegistry } }).CSS
  const Highlight = (globalThis as { Highlight?: HighlightConstructor }).Highlight
  return css?.highlights && Highlight ? { registry: css.highlights, Highlight } : null
}

/** Marks the word spoken at `charIndex` of the element's text (its own text, not a spoken one). */
export function highlightWord(element: HTMLElement, charIndex: number, charLength?: number) {
  const api = highlightApi()
  if (!api) return
  const text = element.textContent ?? ''
  const length = charLength && charLength > 0 ? charLength : (/^\S+/.exec(text.slice(charIndex))?.[0].length ?? 0)
  if (length === 0) return
  const range = rangeAt(element, charIndex, charIndex + length)
  if (range) api.registry.set(WORD_HIGHLIGHT, new api.Highlight(range))
}

export function clearWordHighlight() {
  highlightApi()?.registry.delete(WORD_HIGHLIGHT)
}

/** A DOM range over characters [start, end) of the element's text. */
function rangeAt(element: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  let offset = 0
  let started = false
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const size = node.textContent?.length ?? 0
    if (!started && start < offset + size) {
      range.setStart(node, start - offset)
      started = true
    }
    if (started && end <= offset + size) {
      range.setEnd(node, end - offset)
      return range
    }
    offset += size
  }
  return null
}
