import { createBrowserRouter, RouterProvider } from 'react-router'
import { I18nProvider } from '@/i18n'
import { detectInitialLocale } from '@/i18n/localeStorage'
import { routes } from './routes'

const router = createBrowserRouter(routes)

export function App() {
  return (
    <I18nProvider initialLocale={detectInitialLocale()} persist>
      <RouterProvider router={router} />
    </I18nProvider>
  )
}
