import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'

/** Shell only — the six-step story engine arrives with Epic E4. */
export function StoryPage() {
  const { storyId = '' } = useParams()
  const { t } = useTranslation()
  useDocumentTitle(t('story.title'))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{t('story.title')}</h1>
      <p className="mt-4 text-muted-foreground">{t('story.unavailable', { storyId })}</p>
      <Link
        to={paths.home()}
        className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-cosmic-indigo hover:underline"
      >
        {t('story.exit')}
      </Link>
    </div>
  )
}
