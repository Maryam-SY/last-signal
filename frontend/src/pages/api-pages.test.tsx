import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

describe('destination page (connected to the API)', () => {
  it('shows the missions and their machines', async () => {
    renderRoute('/explore/mars')
    expect(await screen.findByRole('heading', { level: 3, name: 'Test Mission' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Test Rover' })).toBeInTheDocument()
    expect(screen.getByText('Mission ended')).toBeInTheDocument()
    expect(screen.getByText('Location not mapped')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Test Mission' })).toHaveAttribute('href', '#mission-mission-a')
    expect(screen.getByRole('link', { name: 'Discover its story' })).toHaveAttribute('href', '/stories/story-a?from=machine-a')
  })

  it('loads photos and sources of a machine on demand, labelling non-photos', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars')
    const toggle = await screen.findByRole('button', { name: 'Photos, videos and sources' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByAltText('Drawing of a helicopter')).toBeInTheDocument()
    expect(screen.getByText('Artist’s view — not a photo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Test source page/ })).toHaveAttribute('href', 'https://example.org/source')
  })

  it('shows the mission step by step', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars')
    await user.click(await screen.findByRole('button', { name: 'Show the mission step by step' }))
    const timeline = await screen.findByRole('list', { name: 'Step by step' })
    expect(within(timeline).getByText('The rover bounces on its airbags.')).toBeInTheDocument()
    expect(within(timeline).getByText('4 January 2004')).toBeInTheDocument()
  })

  it('brings the visitor back to the machine they came from (anchor after loading)', async () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderRoute('/explore/mars#machine-machine-a')
    const card = await screen.findByRole('heading', { level: 4, name: 'Test Rover' })
    const article = card.closest('article')!
    expect(article).toHaveFocus()
    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('shows a clear error with a retry button when the API does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })))
    renderRoute('/explore/moon')
    expect(await screen.findByRole('alert')).toHaveTextContent('This content could not be loaded.')
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('asks the API in French when the interface is in French', async () => {
    const fetchMock = vi.mocked(fetch)
    renderRoute('/explore/moon', 'fr')
    await screen.findByRole('heading', { level: 3, name: 'Test Mission' })
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('lang=fr')
  })
})

describe('story page (connected to the API)', () => {
  it('shows the first step with its voice, image and draft notice', async () => {
    renderRoute('/stories/story-a')
    expect(await screen.findByRole('heading', { level: 1, name: 'The test story' })).toBeInTheDocument()
    expect(screen.getByText(/still being checked/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Signal' })).toBeInTheDocument()
    expect(screen.getByText('Fact')).toBeInTheDocument()
    expect(screen.getByAltText('A rover on the ground')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  })

  it('moves between steps with the buttons and keeps the step in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/story-a')
    await user.click(await screen.findByRole('button', { name: 'Next step' }))
    expect(router.state.location.search).toContain('step=2')
    expect(screen.getByRole('heading', { level: 2, name: 'Why' })).toHaveFocus()
    expect(screen.getByRole('button', { name: /2\s*Why/ })).toHaveAttribute('aria-current', 'step')
  })

  it('shows what was passed on at the relay step, with its evidence', async () => {
    renderRoute('/stories/story-a?step=5')
    expect(await screen.findByRole('heading', { level: 3, name: 'What was passed on' })).toBeInTheDocument()
    expect(screen.getByText('The airbag landing system.')).toBeInTheDocument()
    expect(screen.getByText('A test document says so.')).toBeInTheDocument()
  })

  it('offers a way back to the machine and to the other destination at the end', async () => {
    renderRoute('/stories/story-a?step=6&from=machine-a')
    expect(await screen.findByText('Imagine')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the machines of Mars' })).toHaveAttribute('href', '/explore/mars#machine-machine-a')
    expect(screen.getByRole('link', { name: 'Explore Moon' })).toHaveAttribute('href', '/explore/moon')
    expect(screen.queryByRole('button', { name: 'Next step' })).not.toBeInTheDocument()
  })

  it('says when a story does not exist', async () => {
    renderRoute('/stories/unknown-story')
    expect(await screen.findByText('The story “unknown-story” is not available yet.')).toBeInTheDocument()
  })
})

describe('about page (connected to the API)', () => {
  it('lists every source with its consultation date', async () => {
    renderRoute('/about')
    expect(await screen.findByRole('link', { name: /Test source page/ })).toBeInTheDocument()
    expect(screen.getByText(/Consulted on 14 November 2026/)).toBeInTheDocument()
  })
})
