import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

// <model-viewer> needs WebGL: in jsdom its module is replaced by an empty one (the element stays inert).
vi.mock('@google/model-viewer', () => ({}))

describe('destination page (connected to the API)', () => {
  it('shows the missions and their machines', async () => {
    renderRoute('/explore/mars')
    expect(await screen.findByRole('heading', { level: 3, name: 'Test Mission' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Test Rover' })).toBeInTheDocument()
    // Scoped to the card: the status legend and the timeline also show status labels.
    const card = screen.getByRole('heading', { level: 4, name: 'Test Rover' }).closest('article')!
    expect(within(card).getByText('Mission ended')).toBeInTheDocument()
    expect(screen.getByText('Location not mapped')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Test Mission' })).toHaveAttribute('href', '#mission-mission-a')
    expect(screen.getByRole('link', { name: 'Discover its story' })).toHaveAttribute('href', '/stories/story-a?from=machine-a')
  })

  it('tells each machine as a short story — what it did, what it passed on, its sources — without any click (US-5.9)', async () => {
    renderRoute('/explore/mars')
    const card = (await screen.findByRole('heading', { level: 4, name: 'Test Rover' })).closest('article')!
    expect(within(card).getByRole('heading', { level: 5, name: 'What it did' })).toBeInTheDocument()
    expect(within(card).getByText('It found traces of ancient water.')).toBeInTheDocument()
    // What it passed on, with both ends named.
    expect(await within(card).findByText('The airbag landing system.')).toBeInTheDocument()
    expect(within(card).getByText('Earlier Mission')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /Test source page/ })).toHaveAttribute('href', 'https://example.org/source')
    // One photo of the machine (US-5.11: in its card), no gallery, no button to unfold anything.
    expect(within(card).getAllByRole('img').length).toBeLessThanOrEqual(1)
    expect(screen.queryByRole('button', { name: 'Photos, videos and sources' })).not.toBeInTheDocument()
  })

  it('illustrates each moment of the mission log with one captioned picture, labelling non-photos (MEDIA-001)', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Step by step' })
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(2)
    expect(within(timeline).getByAltText('A rover on the ground')).toBeInTheDocument()
    expect(within(timeline).getByAltText('Drawing of a helicopter')).toBeInTheDocument()
    expect(within(timeline).getByText('Artist’s view — not a photo')).toBeInTheDocument()
    // One picture per moment: the second picture of "A plan for later" is not shown.
    expect(within(timeline).getAllByRole('img')).toHaveLength(2)
    expect(within(timeline).getAllByText('What you see:')).toHaveLength(2)
  })

  it('flies through the pictures of the mission log, keeping them readable (US-5.11)', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Step by step' })
    const flight = timeline.closest('.photo-flight')!
    // The corridor of pictures is decorative: hidden from screen readers, labelled for the eyes.
    const corridor = flight.querySelector('.photo-flight-world')!
    expect(corridor).toHaveAttribute('aria-hidden', 'true')
    expect(corridor.querySelectorAll('figure')).toHaveLength(2)
    expect(within(corridor as HTMLElement).getByText('Artist’s view — not a photo')).toBeInTheDocument()
  })

  it('tells the story behind a picture, marked as a draft until reviewed (US-5.10)', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Step by step' })
    expect(within(timeline).getByText('An artist drew this helicopter years before one flew.')).toBeInTheDocument()
    expect(screen.getByText(/stories told with these pictures are drafts/)).toBeInTheDocument()
  })

  it('highlights the machine named in ?machine= (US-3.2, map, "Exit story")', async () => {
    renderRoute('/explore/mars?machine=machine-a')
    const card = (await screen.findByRole('heading', { level: 4, name: 'Test Rover' })).closest('article')!
    expect(card).toHaveAttribute('aria-current', 'true')
  })

  it('replaces a remote image that cannot load by a message', async () => {
    renderRoute('/explore/mars?machine=machine-a')
    fireEvent.error(await screen.findByAltText('Drawing of a helicopter'))
    expect(screen.getAllByText(/This image cannot be shown right now/).length).toBeGreaterThan(0)
  })

  it('gives each machine its scroll scene without repeating what the mission log told (US-5.9)', async () => {
    renderRoute('/explore/mars')
    const mission = await screen.findByRole('region', { name: 'Test Mission' })
    const machineScene = await within(mission).findByRole('region', { name: 'Test Rover' })
    // The machine's picture is in its card (US-5.11)…
    expect((await within(machineScene).findAllByAltText('A rover on the ground')).length).toBeGreaterThan(0)
    expect(within(machineScene).getByRole('heading', { level: 4, name: 'Test Rover' })).toBeInTheDocument()
    // …but the steps already told by the mission log are not told again.
    expect(within(machineScene).queryByText('The rover bounces on its airbags.')).not.toBeInTheDocument()
    expect(within(machineScene).queryByAltText('Drawing of a helicopter')).not.toBeInTheDocument()
  })

  it('shows the machine picture inline, without the animated stage, under reduced motion', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    renderRoute('/explore/mars')
    const machineScene = await screen.findByRole('region', { name: 'Test Rover' })
    expect(await within(machineScene).findByAltText('A rover on the ground')).toBeInTheDocument()
    expect(machineScene.querySelector('.journey-card')).toBeNull()
  })

  it('loads the NASA 3D model only when the visitor asks for it', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars')
    const button = await screen.findByRole('button', { name: 'Turn it in 3D' })
    expect(document.querySelector('model-viewer')).toBeNull()
    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    const viewer = await waitForViewer()
    expect(viewer).toHaveAttribute('src', 'https://example.org/models/Test%20Rover.glb')
    expect(viewer).toHaveAttribute('alt', '3D model of the test rover')
    expect(viewer).toHaveAttribute('disable-zoom')
    expect(screen.getByText('Computer image — not a photo')).toBeInTheDocument()
    expect(screen.getByText('A fictional 3D model.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Back to the photos' }))
    expect(document.querySelector('model-viewer')).toBeNull()
  })

  it('tells the mission step by step, with dates and pictures, as the visitor scrolls', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Step by step' })
    expect(within(timeline).getByText('The rover bounces on its airbags.')).toBeInTheDocument()
    expect(within(timeline).getByText('4 January 2004')).toBeInTheDocument()
    expect(within(timeline).getByAltText('A rover on the ground')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sources of this mission (1)' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show the mission step by step' })).not.toBeInTheDocument()
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
    // Scoped to the missions: the timeline, a separate request, reports its own error too.
    const missions = await screen.findByRole('region', { name: 'Missions and machines' })
    expect(await within(missions).findByRole('alert')).toHaveTextContent('This content could not be loaded.')
    expect(within(missions).getByRole('button', { name: 'Try again' })).toBeInTheDocument()
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
    // All six steps are scenes of one scroll (US-5.6): check the first one's content.
    const signal = screen.getByRole('region', { name: 'Signal' })
    expect(within(signal).getByRole('heading', { level: 2, name: 'Signal' })).toBeInTheDocument()
    expect(within(signal).getByText('Fact')).toBeInTheDocument()
    expect(within(signal).getByAltText('A rover on the ground')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  })

  it('changes step with the arrow keys, and not while typing', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/story-a?step=2')
    await screen.findByRole('heading', { level: 1, name: 'The test story' })
    await user.keyboard('{ArrowRight}')
    expect(router.state.location.search).toContain('step=3')
    expect(screen.getByRole('heading', { level: 2, name: 'How' })).toHaveFocus()
    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(router.state.location.search).toContain('step=1')
    await user.keyboard('{ArrowLeft}')
    expect(router.state.location.search).toContain('step=1')
  })

  it('jumps to a step from the step list', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/story-a')
    const steps = await screen.findByRole('navigation', { name: 'Story steps' })
    await user.click(within(steps).getByRole('button', { name: /4\s*Discovery/ }))
    expect(router.state.location.search).toContain('step=4')
    expect(within(steps).getByRole('button', { name: /4\s*Discovery/ })).toHaveAttribute('aria-current', 'step')
    expect(screen.getByRole('heading', { level: 2, name: 'Discovery' })).toHaveFocus()
  })

  it('moves between steps with the buttons and keeps the step in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/stories/story-a')
    await user.click(await screen.findByRole('button', { name: 'Next step' }))
    expect(router.state.location.search).toContain('step=2')
    expect(screen.getByRole('heading', { level: 2, name: 'Why' })).toHaveFocus()
    expect(screen.getByRole('button', { name: /2\s*Why/ })).toHaveAttribute('aria-current', 'step')
  })

  it('names both ends of what was passed on at the relay step', async () => {
    renderRoute('/stories/story-a?step=5')
    const relay = await screen.findByRole('region', { name: 'What was passed on' })
    expect(within(relay).getByText('Earlier Mission')).toBeInTheDocument()
    expect(within(relay).getByText('Test Mission')).toBeInTheDocument()
    expect(within(relay).getByText('From', { exact: false })).toHaveClass('sr-only')
  })

  it('offers the missions and machines of the story at the end (US-4.7)', async () => {
    renderRoute('/stories/story-a?step=6')
    expect(await screen.findByRole('heading', { level: 3, name: 'The missions of this story' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Test Mission' })).toHaveAttribute('href', '/explore/mars#mission-mission-a')
    expect(screen.getByRole('link', { name: 'Test Rover' })).toHaveAttribute('href', '/explore/mars?machine=machine-a#machine-machine-a')
  })

  it('shows what was passed on at the relay step, with its evidence', async () => {
    renderRoute('/stories/story-a?step=5')
    expect(await screen.findByRole('heading', { level: 3, name: 'What was passed on' })).toBeInTheDocument()
    expect(screen.getByText('The airbag landing system.')).toBeInTheDocument()
    expect(screen.getByText('A test document says so.')).toBeInTheDocument()
  })

  it('offers a way back to the machine and to the other destination at the end', async () => {
    renderRoute('/stories/story-a?step=6&from=machine-a')
    // Scoped to the last step: the voices legend at the top also names "Imagine".
    expect(within(await screen.findByRole('region', { name: 'Your turn' })).getByText('Imagine')).toBeInTheDocument()
    // US-4.2 (3): back to the machine the visitor came from, with its details open.
    expect(screen.getByRole('link', { name: 'Back to the machines of Mars' })).toHaveAttribute(
      'href',
      '/explore/mars?machine=machine-a#machine-machine-a',
    )
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

async function waitForViewer(): Promise<Element> {
  const { waitFor } = await import('@testing-library/react')
  let viewer: Element | null = null
  await waitFor(() => {
    viewer = document.querySelector('model-viewer')
    expect(viewer).not.toBeNull()
  })
  return viewer!
}
