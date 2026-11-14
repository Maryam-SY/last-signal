import { useTranslation } from '@/i18n'
import type { Media, MissionWithMachines, Source } from '@/types/content'
import { MissionGroup } from './MissionGroup'

interface MissionGalleryProps {
  missions: readonly MissionWithMachines[]
  covers: ReadonlyMap<string, Media>
  sources: ReadonlyMap<string, Source>
  selectedId: string | null
  onSelect: (machineId: string) => void
}

/** Machines grouped by mission — the base of the exploration, usable without the map (CDC §9). */
export function MissionGallery({ missions, covers, sources, selectedId, onSelect }: MissionGalleryProps) {
  const { t } = useTranslation()
  if (missions.length === 0) return <p className="text-moon-dust">{t('gallery.empty')}</p>

  return (
    <div className="space-y-16">
      {missions.map((mission) => (
        <MissionGroup
          key={mission.id}
          mission={mission}
          covers={covers}
          sources={sources}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
