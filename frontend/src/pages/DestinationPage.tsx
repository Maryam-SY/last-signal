import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { paths } from '@/app/paths'
import { LivePlanet } from '@/components/celestial/LivePlanet'
import { MissionGallery } from '@/components/gallery/MissionGallery'
import { Starfield } from '@/components/celestial/Starfield'
import { WORLD_TRANSITION_NAME } from '@/components/home/worldTransition'
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
            viewTransition
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
              <a
                href="#missions-title"
                className="mt-8 inline-flex min-h-11 items-center rounded-md border border-stellar-cyan/60 px-4 text-sm font-medium hover:bg-nebula-surface"
              >
                {t('destination.missionsTitle')}
              </a>
            </div>

            {body && (
              <div
                className="order-first mx-auto w-[min(72vw,40vh,28rem)] lg:order-none lg:w-full"
                style={{ viewTransitionName: WORLD_TRANSITION_NAME }}
              >
                <LivePlanet body={body} arrivalRipple />
              </div>
            )}
          </div>
        </section>
        <MissionGallery destinationId={destinationId} />
      </div>
    </div>
  )
}
