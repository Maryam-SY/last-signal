import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/i18n'
import { detectInitialLocale, readStoredLocale, storeLocale } from '@/i18n/localeStorage'
import { renderRoute } from '@/test/renderRoute'
import { LanguageSwitcher } from './LanguageSwitcher'

afterEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('language switcher', () => {
  it('is in the header, with English selected by default', () => {
    renderRoute('/about')
    const group = screen.getByRole('group', { name: 'Language' })
    expect(within(group).getByRole('button', { name: 'English (EN)' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(group).getByRole('button', { name: 'Français (FR)' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the whole interface to French', async () => {
    const user = userEvent.setup()
    renderRoute('/about')
    await user.click(screen.getByRole('button', { name: 'Français (FR)' }))
    expect(screen.getByRole('heading', { level: 1, name: 'À propos et sources' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Langue' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Français (FR)' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.lang).toBe('fr')
  })

  it('reloads the content from the API in the new language', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.mocked(fetch)
    renderRoute('/explore/mars')
    await screen.findByRole('heading', { level: 3, name: 'Test Mission' })
    await user.click(screen.getByRole('button', { name: 'Français (FR)' }))
    await screen.findByRole('heading', { level: 2, name: 'Missions et machines' })
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/api/destinations/mars?lang=fr'))).toBe(true)
  })

  it('remembers the choice when the provider persists it', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider persist>
        <LanguageSwitcher />
      </I18nProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Français (FR)' }))
    expect(readStoredLocale()).toBe('fr')
  })
})

describe('initial language', () => {
  it('prefers the saved choice', () => {
    storeLocale('fr')
    expect(detectInitialLocale()).toBe('fr')
  })

  it('falls back to the browser language, then to English', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-SN', 'en'])
    expect(detectInitialLocale()).toBe('fr')
    // The browser's order of preference wins: English first means English.
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US', 'fr-FR'])
    expect(detectInitialLocale()).toBe('en')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['wo-SN', 'fr'])
    expect(detectInitialLocale()).toBe('fr')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE'])
    expect(detectInitialLocale()).toBe('en')
  })

  it('ignores an invalid saved value and never throws if storage is blocked', () => {
    window.localStorage.setItem('aeroreborn.locale', 'klingon')
    expect(readStoredLocale()).toBeNull()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredLocale()).toBeNull()
    expect(() => storeLocale('fr')).not.toThrow()
  })
})
