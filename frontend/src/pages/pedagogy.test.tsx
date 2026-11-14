import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetExplorerLogCache } from '@/lib/explorerLog'
import { renderRoute } from '@/test/renderRoute'

beforeEach(() => {
  window.localStorage.clear()
  __resetExplorerLogCache()
})

describe('site map (US-3.3, US-3.4)', () => {
  it('shows one named marker per located machine, with the schematic disclaimer', async () => {
    renderRoute('/explore/moon')
    const map = await screen.findByRole('group', { name: 'Map of the machines on Moon' })
    expect(within(map).getByRole('button', { name: 'Test Lander, Test Mission' })).toBeInTheDocument()
    expect(screen.getByText('Simplified map — positions are approximate.')).toBeInTheDocument()
    expect(screen.getByText(/not a satellite image/)).toBeInTheDocument()
  })

  it('selects the machine from its marker: URL, open card and coordinates readout (SYNC-001)', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/explore/moon')
    const marker = await screen.findByRole('button', { name: 'Test Lander, Test Mission' })
    await user.click(marker)
    expect(router.state.location.search).toBe('?machine=machine-m')
    expect(marker).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { level: 4, name: 'Test Lander' }).closest('article')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Latitude 0.67° N · Longitude 23.47° E')).toBeInTheDocument()
  })

  it('lights up the marker when the card is opened from the gallery (SYNC-002)', async () => {
    renderRoute('/explore/moon?machine=machine-m')
    expect(await screen.findByRole('button', { name: 'Test Lander, Test Mission' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lists the machines it cannot place, and draws no marker for them (MAP-003)', async () => {
    renderRoute('/explore/mars')
    await screen.findByRole('group', { name: 'Map of the machines on Mars' })
    expect(screen.getByText(/Not on the map .*Test Rover/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Test Rover, Test Mission' })).not.toBeInTheDocument()
  })
})

describe('photos, statuses and timeline', () => {
  it('shows the cover photo of a machine with its credit (US-5.7)', async () => {
    renderRoute('/explore/moon')
    expect(await screen.findByAltText('A lander on grey ground')).toBeInTheDocument()
    // Credited on the machine's stage ("Credit: …") or on a cover ("Photo: …").
    expect(screen.getAllByText(/(Credit|Photo): NASA\/JPL/).length).toBeGreaterThan(0)
  })

  it('explains every status in words', async () => {
    renderRoute('/explore/mars')
    await screen.findByRole('heading', { level: 3, name: 'Test Mission' })
    expect(screen.getByText('What do the statuses mean?')).toBeInTheDocument()
    expect(screen.getByText('Switched off or no longer used, but still in place.')).toBeInTheDocument()
  })

  it('puts both worlds on one timeline and spells out the gap between years (US-5.8)', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Timeline of the machines on the Moon and Mars' })
    expect(within(timeline).getByText('35 years later')).toBeInTheDocument()
    expect(within(timeline).getByRole('link', { name: /Test Lander/ })).toHaveAttribute(
      'href',
      '/explore/moon?machine=machine-m#machine-machine-m',
    )
    expect(within(timeline).getByText('You are here', { exact: false })).toBeInTheDocument()
  })
})

describe('story pedagogy (US-5.7)', () => {
  it('explains the three voices before the story starts', async () => {
    renderRoute('/stories/story-a')
    const legend = await screen.findByRole('region', { name: 'Three voices tell this story' })
    expect(within(legend).getByText('A fact, checked in a source you can open.')).toBeInTheDocument()
    expect(within(legend).getByText('An invitation to imagine — never a fact.')).toBeInTheDocument()
  })

  it('offers the words used in a step, with their definition and draft notice', async () => {
    renderRoute('/stories/story-a')
    const signal = await screen.findByRole('region', { name: 'Signal' })
    const words = await within(signal).findByRole('complementary', { name: 'Words to know' })
    expect(within(words).getByText('Signal')).toBeInTheDocument()
    expect(within(words).getByText('A test definition of a signal.')).toBeInTheDocument()
    expect(within(words).getByText(/still being checked/)).toBeInTheDocument()
    // Only where the word is used.
    expect(within(screen.getByRole('region', { name: 'Why' })).queryByRole('complementary')).not.toBeInTheDocument()
  })

  it('keeps the "Your turn" answer on this device only', async () => {
    const user = userEvent.setup()
    renderRoute('/stories/story-a?step=6')
    const field = await screen.findByRole('textbox', { name: 'Your answer' })
    await user.type(field, 'A mirror')
    expect(window.localStorage.getItem('aeroreborn.notebook.story-a')).toBe('A mirror')
    expect(screen.getByText('Saved on this device.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Erase' }))
    expect(field).toHaveValue('')
    expect(window.localStorage.getItem('aeroreborn.notebook.story-a')).toBeNull()
  })
})

describe('explorer log (US-5.8)', () => {
  it('records the world visited and the story finished, and awards badges', async () => {
    renderRoute('/explore/mars')
    await screen.findByRole('heading', { level: 3, name: 'Test Mission' })
    expect(JSON.parse(window.localStorage.getItem('aeroreborn.explorer-log')!)).toMatchObject({ worlds: ['mars'] })

    renderRoute('/stories/story-a?step=6')
    const logs = await screen.findAllByRole('region', { name: 'Your explorer log' })
    const log = logs[logs.length - 1]!
    expect(await within(log).findByText('1 of 1')).toBeInTheDocument() // stories completed
    const storyteller = within(log).getByText('Storyteller').closest('li')!
    expect(storyteller).toHaveTextContent('earned')
    expect(within(log).getByText('Two worlds').closest('li')).toHaveTextContent('not yet earned')
  })
})
