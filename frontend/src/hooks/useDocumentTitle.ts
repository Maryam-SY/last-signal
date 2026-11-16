import { useEffect } from 'react'
import { useTranslation } from '@/i18n'

/** Search-result length: a description is cut at a word near 160 characters. */
function shorten(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:.]$/, '')}…`
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

/**
 * Sets "<page> · OrbeMoria" as the document title (announced by screen readers on navigation)
 * and the page's description for search engines, which run the site's JavaScript (link
 * previews in messaging apps only read index.html). Without a description of its own, a page
 * gets the site's.
 */
export function useDocumentTitle(pageTitle: string, description?: string | null): void {
  const { t } = useTranslation()
  useEffect(() => {
    const title = t('app.documentTitle', { page: pageTitle })
    const text = shorten(description || t('app.description'))
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', text)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', text)
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonical) canonical.href = `https://aeroreborn.vercel.app${window.location.pathname}`
  }, [pageTitle, description, t])
}
