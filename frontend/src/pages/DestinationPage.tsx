import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { Planet } from '@/components/celestial/Planet'
import { Starfield } from '@/components/celestial/Starfield'
import { getBodyByDestination } from '@/content/celestialBodies'
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
  const body = getBodyByDestination(destinationId)
  const name = t(`bodies.${destinationId}.name`)
  useDocumentTitle(name)

  return (
    <div className="relative overflow-hidden">
      <Starfield />
      <div className="relative z-10">
        <section className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center px-5 py-16">
          <Link
            to={paths.home()}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-cosmic-indigo hover:underline"
          >
            <ArrowLeft className="size-4" />
            {t('destination.backToDestinations')}
          </Link>

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.35em] text-stellar-cyan">
                {t(`bodies.${destinationId}.kind`)}
              </p>
              <h1 className="mt-4 font-heading text-5xl font-bold sm:text-6xl">{name}</h1>
              <p className="mt-5 max-w-xl text-moon-dust">
                {t(`bodies.${destinationId}.description`)}
              </p>
              <p className="mt-8 max-w-xl rounded-lg border border-stellar-border/60 bg-nebula-surface/40 p-4 text-sm text-moon-dust">
                {t('destination.placeholder', { destination: name })}
              </p>
            </div>

            {body && (
              <div className="mx-auto w-full max-w-[26rem]">
                <Planet body={body} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
