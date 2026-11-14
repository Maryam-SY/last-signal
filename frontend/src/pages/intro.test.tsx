import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

const playing = () => Promise.resolve()

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  window.HTMLMediaElement.prototype.play = () => Promise.reject(new Error('jsdom cannot play media'))
})

describe('intro video (US-2.4)', () => {
  it('plays first, full screen, muted, with a focused "Skip intro" button', async () => {
    window.HTMLMediaElement.prototype.play = playing
    renderRoute('/')
    const intro = screen.getByRole('region', { name: 'Introduction' })
    const video = intro.querySelector('video')!
    expect(video).toHaveAttribute('src', '/media/intro.mp4')
    expect(video.muted).toBe(true)
    expect(screen.getByText('Contains animation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip intro' })).toHaveFocus()
  })

  it('fades into the home page when the video ends, and only once per visit', async () => {
    window.HTMLMediaElement.prototype.play = playing
    const first = renderRoute('/')
    fireEvent.ended(screen.getByRole('region', { name: 'Introduction' }).querySelector('video')!)
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument(), { timeout: 2000 })
    expect(window.sessionStorage.getItem('aeroreborn.intro-seen')).toBe('1')
    first.unmount()

    renderRoute('/')
    expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument()
  })

  it('can be skipped with the button or Escape', async () => {
    const user = userEvent.setup()
    window.HTMLMediaElement.prototype.play = playing
    const first = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Skip intro' }))
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument(), { timeout: 2000 })
    first.unmount()

    window.sessionStorage.clear()
    renderRoute('/')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument(), { timeout: 2000 })
  })

  it('is skipped when the browser refuses to play it', async () => {
    renderRoute('/')
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { level: 1, name: 'Choose your destination' })).toBeInTheDocument()
  })

  it('never plays under reduced motion, and the title is shown whole', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    renderRoute('/')
    expect(screen.queryByRole('region', { name: 'Introduction' })).not.toBeInTheDocument()
    expect(document.querySelectorAll('h1 .scatter-letter.invisible')).toHaveLength(0)
  })

  it('types the title letter by letter after the intro, its full text always readable', async () => {
    vi.useFakeTimers()
    renderRoute('/')
    // The refused autoplay ends the intro on the next microtask.
    await act(async () => {
      await Promise.resolve()
    })
    const heading = screen.getByRole('heading', { level: 1, name: 'Choose your destination' })
    const hidden = () => heading.querySelectorAll('.scatter-letter.invisible').length
    const total = heading.querySelectorAll('.scatter-letter').length
    expect(hidden()).toBe(total)
    await act(async () => {
      vi.advanceTimersByTime(650 + 70 * 5)
    })
    expect(hidden()).toBeLessThan(total)
    expect(hidden()).toBeGreaterThan(0)
    await act(async () => {
      vi.advanceTimersByTime(70 * total)
    })
    expect(hidden()).toBe(0)
  })
})
