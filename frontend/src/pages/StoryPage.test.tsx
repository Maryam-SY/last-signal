import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockApi } from '@/test/mockApi'
import { renderRoute } from '@/test/renderRoute'

describe('story page (US-4.1 → US-4.4, US-4.7)', () => {
  beforeEach(() => {
    mockApi()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens on the Signal step with its title, voice label, media and draft notice', async () => {
    renderRoute('/stories/test-story?step=1')
    expect(await screen.findByRole('heading', { level: 1, name: 'The Test Story' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Signal' })).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    expect(screen.getByText('Fact')).toBeInTheDocument()
    // An artist's view is never shown without its visible label (CLAUDE.md §7).
    expect(screen.getByRole('img', { name: 'Alt text of test-rover-artwork' })).toBeInTheDocument()
    expect(screen.getByText('Artist’s view — not a photo')).toBeInTheDocument()
    expect(screen.getByText(/Draft — every fact here is sourced/)).toBeInTheDocument()
    expect(document.title).toBe('The Test Story · AeroReborn')
  })

  it.each(['/stories/test-story', '/stories/test-story?step=9', '/stories/test-story?step=abc'])(
    'falls back to step 1 for %s',
    async (path) => {
      renderRoute(path)
      expect(await screen.findByRole('heading', { level: 2, name: 'Signal' })).toBeInTheDocument()
    },
  )

  it('moves to the next step, updates the URL and focuses the step title', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/test-story?step=1')
    expect(await screen.findByRole('button', { name: 'Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    const title = screen.getByRole('heading', { level: 2, name: 'Why' })
    expect(title).toHaveFocus()
    expect(router.state.location.search).toBe('?step=2')
    expect(screen.getByText('What it means')).toBeInTheDocument()
  })

  it('marks the current step in the progress list and lets the reader jump to a step', async () => {
    const user = userEvent.setup()
    renderRoute('/stories/test-story?step=2')
    const progress = await screen.findByRole('navigation', { name: 'Story steps' })
    expect(within(progress).getByRole('button', { name: 'Step 2: Why' })).toHaveAttribute('aria-current', 'step')
    await user.click(within(progress).getByRole('button', { name: 'Step 4: Discovery' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Discovery' })).toHaveFocus()
  })

  it('returns to the previous step with the browser back button', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/test-story?step=2')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    expect(screen.getByRole('heading', { level: 2, name: 'How' })).toBeInTheDocument()
    await act(() => router.navigate(-1))
    expect(screen.getByRole('heading', { level: 2, name: 'Why' })).toBeInTheDocument()
  })

  it('shows what was passed on, with evidence, on the relay step', async () => {
    renderRoute('/stories/test-story?step=5')
    expect(await screen.findByText('A fictional technology.')).toBeInTheDocument()
    expect(screen.getByText('A fictional report.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Test Lander.*Test Rover/ })).toBeInTheDocument()
  })

  it('reveals a source without changing step, with a link announced as opening a new tab', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/test-story?step=1')
    await user.click(await screen.findByRole('button', { name: 'Source' }))
    const panel = screen.getByRole('region', { name: 'Where this comes from' })
    const link = within(panel).getByRole('link', { name: 'Test reference page (opens in a new tab)' })
    expect(link).toHaveAttribute('href', 'https://example.org/test')
    expect(link).toHaveAttribute('target', '_blank')
    expect(within(panel).getByText('Test Archive')).toBeInTheDocument()
    expect(within(panel).getByText('Consulted on November 14, 2026')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?step=1')
  })

  it('ends with the three ways to keep exploring and an imagination block', async () => {
    renderRoute('/stories/test-story?step=6')
    expect(await screen.findByText('What would you build?')).toBeInTheDocument()
    expect(screen.getByText('Imagine')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Test Mission' })).toHaveAttribute(
      'href',
      '/explore/mars#mission-test-mission',
    )
    expect(screen.getByRole('link', { name: 'Travel to Moon' })).toHaveAttribute('href', '/explore/moon')
    expect(screen.getByRole('link', { name: 'Test Lander' })).toHaveAttribute('href', '/explore/mars?machine=test-lander')
  })

  it('exits to the destination with the original machine selected', async () => {
    renderRoute('/stories/test-story?step=3&from=test-rover')
    expect(await screen.findByRole('link', { name: 'Exit story' })).toHaveAttribute(
      'href',
      '/explore/mars?machine=test-rover',
    )
  })

  it('says when a story does not exist', async () => {
    renderRoute('/stories/unknown')
    expect(await screen.findByText('This story does not exist or has not been published yet.')).toBeInTheDocument()
  })

  it('offers to retry when the API cannot be reached', async () => {
    vi.unstubAllGlobals()
    const fetchMock = mockApi({}, ['/api/stories/test-story'])
    const user = userEvent.setup()
    renderRoute('/stories/test-story')
    await user.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
