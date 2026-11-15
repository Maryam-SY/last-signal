import { useEffect, useState, type RefObject } from 'react'

/**
 * True once the element has entered the viewport (and stays true): used to start a scene's
 * sequence when the visitor reaches it. Without IntersectionObserver (tests, old browsers) it
 * is true at once, so nothing is ever hidden.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '0px 0px -20% 0px'): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const element = ref.current
    if (!element || inView || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { rootMargin, threshold: 0.2 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, inView, rootMargin])

  return inView
}
