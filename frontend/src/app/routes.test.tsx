import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

describe('routes', () => {
  it('shows the destination selector on /', () => {
    renderRoute('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Choose your destination' })).toBeInTheDocument()
    const moonLinks = screen.getAllByRole('link', { name: 'Explore the Moon' })
    expect(moonLinks.length).toBeGreaterThan(0)
    for (const link of moonLinks) expect(link).toHaveAttribute('href', '/explore/moon')
    expect(screen.getByRole('link', { name: 'Explore Mars' })).toHaveAttribute('href', '/explore/mars')
    expect(document.title).toBe('Choose your destination · AeroReborn')
  })

  it('navigates to a destination when its card is activated', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('link', { name: 'Explore Mars' }))
    expect(router.state.location.pathname).toBe('/explore/mars')
    expect(screen.getByRole('heading', { level: 1, name: 'Mars' })).toBeInTheDocument()
  })

  it('renders the Moon destination page with a way back', () => {
    renderRoute('/explore/moon')
    expect(screen.getByRole('heading', { level: 1, name: 'Moon' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Back to destinations/ })).toHaveAttribute('href', '/')
  })

  it.each(['/explore/pluto', '/unknown/path'])('shows the not-found page for %s', (path) => {
    renderRoute(path)
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('renders the story route (unknown story → clear message)', async () => {
    renderRoute('/stories/apollo-12')
    expect(screen.getByRole('heading', { level: 1, name: 'Story' })).toBeInTheDocument()
    expect(await screen.findByText(/apollo-12/)).toBeInTheDocument()
  })

  it('shows the non-affiliation statement on /about', () => {
    renderRoute('/about')
    expect(screen.getByRole('heading', { level: 1, name: 'About & Sources' })).toBeInTheDocument()
    // Once in the page body, once in the footer.
    expect(
      screen.getAllByText('Independent project, not affiliated with or endorsed by NASA.'),
    ).toHaveLength(2)
  })

  it('exposes the main navigation with the current page marked', () => {
    renderRoute('/about')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About & Sources' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Explore' })).not.toHaveAttribute('aria-current')
  })

  it('offers a skip link to the main content', () => {
    renderRoute('/')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main-content')
    expect(document.getElementById('main-content')).toBeInTheDocument()
  })

  it('switches the interface language from the header', async () => {
    const user = userEvent.setup()
    renderRoute('/about')
    const group = screen.getByRole('group', { name: 'Language' })
    await user.click(within(group).getByRole('button', { name: 'fr' }))
    expect(screen.getByRole('heading', { level: 1, name: 'À propos et sources' })).toBeInTheDocument()
    expect(within(group).getByRole('button', { name: 'fr' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.lang).toBe('fr')
  })

  it('renders the interface in French when the locale is fr', () => {
    renderRoute('/', 'fr')
    expect(screen.getByRole('heading', { level: 1, name: 'Choisis ta destination' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Explorer la Lune' }).length).toBeGreaterThan(0)
    expect(document.documentElement.lang).toBe('fr')
  })
})
