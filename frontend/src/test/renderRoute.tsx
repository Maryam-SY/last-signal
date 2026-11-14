import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '@/app/routes'
import { I18nProvider, type Locale } from '@/i18n'

/** Renders the real route table at `path`, with the i18n provider, for integration tests. */
export function renderRoute(path: string, locale: Locale = 'en') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const result = render(
    <I18nProvider initialLocale={locale}>
      <RouterProvider router={router} />
    </I18nProvider>,
  )
  return { ...result, router }
}
