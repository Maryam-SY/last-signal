import { useEffect } from 'react'
import { useTranslation } from '@/i18n'

/** Sets "<page> · AeroReborn" as the document title (announced by screen readers on navigation). */
export function useDocumentTitle(pageTitle: string): void {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = t('app.documentTitle', { page: pageTitle })
  }, [pageTitle, t])
}
