import { screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  )
}

describe('home depth journey', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('depth-mode')
  })

  it('puts exactly the Moon and Mars at the centre, each as one named link', () => {
    renderRoute('/')
    const list = screen.getByRole('list', { name: 'Destinations' })
    const links = within(list).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual(['Explore the Moon', 'Explore Mars'])
  })

  it('offers a chapter per destination and the journey indicator', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 2, name: 'Moon' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Mars' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Land on Mars' })).toHaveAttribute('href', '/explore/mars')
    const journey = screen.getByRole('navigation', { name: 'Journey' })
    expect(within(journey).getAllByRole('button')).toHaveLength(5)
    expect(document.documentElement).toHaveClass('depth-mode')
  })

  it('explains the visit in three stages and invites to start (US-5.11)', () => {
    renderRoute('/')
    const expedition = screen.getByRole('region', { name: 'Three stages, no prior knowledge needed' })
    expect(within(expedition).getAllByRole('listitem')).toHaveLength(3)
    expect(within(expedition).getByRole('heading', { level: 3, name: 'Descend to the surface' })).toBeInTheDocument()
    expect(within(expedition).getByRole('link', { name: 'Start with the Moon' })).toHaveAttribute('href', '/explore/moon')
  })

  it('shows the numbers of the site from the API (US-5.11)', async () => {
    renderRoute('/')
    // Two destinations in the fixtures: "2 worlds" (the final value is always in the text).
    const worlds = (await screen.findByText('worlds')).closest('div')!
    expect(within(worlds).getAllByText('2').length).toBeGreaterThan(0)
    expect(screen.getByText('machines still there')).toBeInTheDocument()
  })

  it('falls back to ordinary sections under reduced motion (NFR-A11Y-006)', () => {
    mockReducedMotion(true)
    renderRoute('/')
    expect(screen.queryByRole('navigation', { name: 'Journey' })).not.toBeInTheDocument()
    expect(document.documentElement).not.toHaveClass('depth-mode')
    expect(screen.getByRole('link', { name: 'Explore Mars' })).toHaveAttribute('href', '/explore/mars')
  })
})
