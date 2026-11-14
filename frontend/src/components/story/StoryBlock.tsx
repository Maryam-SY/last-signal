import { MediaFigure } from '@/components/media/MediaFigure'
import { SourceBadge } from '@/components/sources/SourceBadge'
import { VoiceTag } from '@/components/sources/VoiceTag'
import type { ContentIndex } from '@/lib/contentIndex'
import { cn } from '@/lib/utils'
import type { StoryBlock as StoryBlockData } from '@/types/content'

const VOICE_FRAME = {
  data: 'border-l-2 border-stellar-gold/80 bg-nebula-surface/50',
  interpretation: 'border-l-2 border-dashed border-cosmic-indigo/80 bg-nebula-surface/30',
  imagination: 'border-2 border-dotted border-nebula-purple/70 bg-nebula-purple/5',
} as const

/** One block of a story: voice label, text, its illustrations, access to its sources. */
export function StoryBlock({ block, index }: { block: StoryBlockData; index: ContentIndex }) {
  const media = (block.mediaIds ?? []).flatMap((id) => index.media.get(id) ?? [])
  return (
    <article className={cn('rounded-xl p-4 sm:p-5', VOICE_FRAME[block.voice])}>
      <VoiceTag voice={block.voice} />
      <p
        className={cn(
          'mt-3 text-lg leading-relaxed text-starlight sm:text-xl',
          block.voice === 'imagination' && 'font-heading italic',
        )}
      >
        {block.text}
      </p>
      {media.length > 0 && (
        <div className={cn('mt-4 grid gap-3', media.length > 1 && 'sm:grid-cols-2')}>
          {media.map((item) => (
            <MediaFigure key={item.id} media={item} withDescription imageClassName="max-h-[26rem] rounded-lg" />
          ))}
        </div>
      )}
      <SourceBadge sourceIds={block.sourceIds} sources={index.sources} className="mt-2" />
    </article>
  )
}
