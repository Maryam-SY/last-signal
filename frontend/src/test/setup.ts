import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { installMockApi } from './mockApi'

// Every test talks to a fake API built from fixtures; tests can override it with vi.stubGlobal.
beforeEach(() => {
  installMockApi()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

// jsdom has no canvas implementation; WarpField simply skips drawing when there is no context.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext

// jsdom does not scroll; the router's scroll restoration and the immersive pages call these.
window.scrollTo = (() => {}) as typeof window.scrollTo

// jsdom cannot play media: by default the intro video "refuses" to play (as a browser that
// blocks autoplay would), so pages render straight away. Intro tests override this.
window.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('jsdom cannot play media'))
window.HTMLMediaElement.prototype.pause = () => {}
