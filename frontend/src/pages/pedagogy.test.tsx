import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { __resetExplorerLogCache } from '@/lib/explorerLog'
import { renderRoute } from '@/test/renderRoute'

beforeEach(() => {
  window.localStorage.clear()
  __resetExplorerLogCache()
})

describe('photos, statuses and timeline', () => {
  it('shows the photo of a machine, without a credit line under it (US-5.7, US-5.11)', async () => {
    renderRoute('/explore/mars/machine-a')
    expect((await screen.findAllByAltText('A rover on the ground')).length).toBeGreaterThan(0)
    // US-5.11 (team decision 2026-11-14): picture credits are listed once, on the About page.
    expect(screen.queryByText(/(Credit|Photo): NASA\/JPL/)).not.toBeInTheDocument()
  })

  it('lists every picture credit once, on the About page (US-5.11, ABOUT-001)', async () => {
    renderRoute('/about')
    const credits = await screen.findByRole('region', { name: 'Credits' })
    // Grouped by credit holder: the fixtures have two NASA/JPL items and one without credit.
    expect(await within(credits).findByText('NASA/JPL')).toBeInTheDocument()
    expect(within(credits).getByText('Credit not shown on the source page')).toBeInTheDocument()
    expect(within(credits).getByText(/Deep Star Maps 2020/)).toBeInTheDocument()
    expect(within(credits).getByText('Artist’s view — not a photo')).toBeInTheDocument()
  })

  it('explains every status in words', async () => {
    renderRoute('/explore/mars')
    await screen.findByRole('heading', { level: 2, name: 'Choose a machine' })
    expect(screen.getByText('What do the statuses mean?')).toBeInTheDocument()
    expect(screen.getByText('Switched off or no longer used, but still in place.')).toBeInTheDocument()
  })

  it('shows the timeline of this world only, and spells out the gap between years (US-5.13)', async () => {
    renderRoute('/explore/mars')
    const timeline = await screen.findByRole('list', { name: 'Timeline of Mars' })
    expect(within(timeline).getByText('35 years later')).toBeInTheDocument()
    expect(within(timeline).getByRole('heading', { name: 'Arrival' })).toBeInTheDocument()
    expect(within(timeline).getByText('The rover lands on Mars.')).toBeInTheDocument()
    // Nothing from the other world.
    expect(within(timeline).queryByText(/Test Lander|Moon/)).not.toBeInTheDocument()
  })
})

describe('story pedagogy (US-5.7)', () => {
  it('explains the three voices before the story starts', async () => {
    renderRoute('/stories/story-a')
    const legend = await screen.findByRole('region', { name: 'Three voices tell this story' })
    expect(within(legend).getByText('A fact, checked in a source you can open.')).toBeInTheDocument()
    expect(within(legend).getByText('An invitation to imagine — never a fact.')).toBeInTheDocument()
  })

  it('offers the words used in a step, with their definition and no draft notice', async () => {
    renderRoute('/stories/story-a')
    const signal = await screen.findByRole('region', { name: 'Signal' })
    const words = await within(signal).findByRole('complementary', { name: 'Words to know' })
    expect(within(words).getByText('Signal')).toBeInTheDocument()
    expect(within(words).getByText('A test definition of a signal.')).toBeInTheDocument()
    expect(within(words).queryByText(/still being checked/)).not.toBeInTheDocument()
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
  it('records the world visited and the story finished, without showing an explorer box (US-5.13)', async () => {
    renderRoute('/explore/mars')
    await screen.findByRole('heading', { level: 2, name: 'Choose a machine' })
    expect(JSON.parse(window.localStorage.getItem('aeroreborn.explorer-log')!)).toMatchObject({ worlds: ['mars'] })
    expect(screen.queryByRole('region', { name: 'Your explorer log' })).not.toBeInTheDocument()

    renderRoute('/stories/story-a?step=6')
    await waitFor(() => expect(JSON.parse(window.localStorage.getItem('aeroreborn.explorer-log')!)).toMatchObject({ stories: ['story-a'] }))
    expect(screen.queryByRole('region', { name: 'Your explorer log' })).not.toBeInTheDocument()
  })
})
