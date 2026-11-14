import { Link } from 'react-router'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

export function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('notFound.title'))

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold sm:text-4xl">{t('notFound.title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('notFound.message')}</p>
      <Link
        to={paths.home()}
        className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-cosmic-indigo hover:underline"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}
