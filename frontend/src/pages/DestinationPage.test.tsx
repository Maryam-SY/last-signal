import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockApi } from '@/test/mockApi'
import { renderRoute } from '@/test/renderRoute'

describe('destination gallery and machine details (US-3.1, US-3.2)', () => {
  beforeEach(() => {
    mockApi()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('groups machines under their mission with sourced period and status', async () => {
    renderRoute('/explore/mars')
    const mission = await screen.findByRole('region', { name: 'Test Mission' })
    expect(within(mission).getByText('January 4, 2004 – March 22, 2010')).toBeInTheDocument()
    const list = within(mission).getByRole('list', { name: 'Machines left by Test Mission' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(within(list).getByText('Mission ended')).toBeInTheDocument()
    expect(within(list).getByText('Status not confirmed')).toBeInTheDocument()
  })

  it('uses the destination intro, the mission story and a real photo as the machine cover', async () => {
    renderRoute('/explore/mars')
    const mission = await screen.findByRole('region', { name: 'Test Mission' })
    expect(screen.getByText('A fictional introduction to Mars.')).toBeInTheDocument()
    expect(within(mission).getByRole('link', { name: /Discover the story/ })).toHaveAttribute('href', '/stories/test-story')
    const rover = within(mission).getByRole('button', { name: 'Open the details of Test Rover' })
    // The photo wins over the artist's view, so no "not a photo" label on the card.
    expect(within(rover).getByRole('img', { name: 'Alt text of test-rover-photo' })).toBeInTheDocument()
    expect(within(rover).queryByText('Artist’s view — not a photo')).not.toBeInTheDocument()
  })

  it('replaces a remote image that fails to load by a placeholder', async () => {
    renderRoute('/explore/mars')
    const rover = await screen.findByRole('button', { name: 'Open the details of Test Rover' })
    fireEvent.error(within(rover).getByRole('img'))
    expect(within(rover).getByText('Image unavailable right now')).toBeInTheDocument()
  })

  it('reveals the key moments of a mission on demand', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars')
    const toggle = await screen.findByRole('button', { name: /Key moments \(1\)/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(await screen.findByRole('heading', { level: 4, name: 'Test landing' })).toBeInTheDocument()
    expect(screen.getByText('The fictional rover lands.')).toBeInTheDocument()
    expect(screen.getByText('Artist’s view — not a photo')).toBeInTheDocument()
  })

  it('requests the content in the interface language', async () => {
    const fetchMock = mockApi()
    renderRoute('/explore/mars', 'fr')
    await screen.findByRole('region', { name: 'Test Mission' })
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe('/api/destinations/mars?lang=fr')
  })

  it('shows "Location not mapped" for a machine without coordinates', async () => {
    renderRoute('/explore/mars')
    const lander = await screen.findByRole('button', { name: 'Open the details of Test Lander' })
    expect(within(lander).getByText('Location not mapped')).toBeInTheDocument()
    const rover = screen.getByRole('button', { name: 'Open the details of Test Rover' })
    expect(within(rover).queryByText('Location not mapped')).not.toBeInTheDocument()
  })

  it('opens the details in the URL, closes with Escape and gives the focus back to the card', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/explore/mars')
    const card = await screen.findByRole('button', { name: 'Open the details of Test Rover' })
    await user.click(card)
    expect(router.state.location.search).toBe('?machine=test-rover')

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('heading', { name: 'Test Rover' })).toBeInTheDocument()
    expect(within(dialog).getByText('14.5° S, 175.47° E')).toBeInTheDocument()
    expect(within(dialog).getByText('Test convention note.')).toBeInTheDocument()
    expect(within(dialog).getByText('2003-027A')).toBeInTheDocument()
    expect(within(dialog).getByText('A fictional technology.')).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /Watch the video/ })).toHaveAttribute('href', 'https://example.org/test-rover-video')
    expect(within(dialog).getByText('Contains animation')).toBeInTheDocument()
    expect(within(dialog).getByRole('link', { name: /Discover its story/ })).toHaveAttribute(
      'href',
      '/stories/test-story?from=test-rover',
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('')
    expect(card).toHaveFocus()
  })

  it('opens the details directly from ?machine= and ignores unknown machines', async () => {
    renderRoute('/explore/mars?machine=test-rover')
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('ignores a machine that is not on this destination', async () => {
    renderRoute('/explore/mars?machine=nope')
    await screen.findByRole('region', { name: 'Test Mission' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('says when no mission is published yet', async () => {
    renderRoute('/explore/moon')
    expect(await screen.findByText('No mission has been published for this destination yet.')).toBeInTheDocument()
  })
})
