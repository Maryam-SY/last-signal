import { DestinationLink } from '@/components/destination/DestinationLink'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n'
import { DESTINATION_IDS } from '@/types/content'

export function ExplorePage() {
  const { t } = useTranslation()
  useDocumentTitle(t('explore.title'))

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <h1 className="text-3xl font-bold sm:text-5xl">{t('explore.title')}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{t('explore.intro')}</p>
      <ul aria-label={t('explore.destinationsLabel')} className="mt-8 grid gap-4 sm:grid-cols-2">
        {DESTINATION_IDS.map((id) => (
          <li key={id}>
            <DestinationLink id={id} />
          </li>
        ))}
      </ul>
    </div>
  )
}
