import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { isDestinationId, type DestinationId } from '@/types/content'
import { NotFoundPage } from './NotFoundPage'

export function DestinationPage() {
  const { destinationId } = useParams()
  if (!isDestinationId(destinationId)) {
    return <NotFoundPage />
  }
  return <DestinationView destinationId={destinationId} />
}

function DestinationView({ destinationId }: { destinationId: DestinationId }) {
  const { t } = useTranslation()
  const name = t(`destinations.${destinationId}.name`)
  useDocumentTitle(name)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link
        to={paths.home()}
        className="inline-flex min-h-11 items-center text-sm font-medium text-cosmic-indigo hover:underline"
      >
        ← {t('destination.backToDestinations')}
      </Link>
      <h1 className="mt-4 text-3xl font-bold sm:text-5xl">{name}</h1>
      <p className="mt-4 text-muted-foreground">{t('destination.placeholder', { destination: name })}</p>
    </div>
  )
}
