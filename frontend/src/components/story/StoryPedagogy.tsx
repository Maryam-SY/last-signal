import { useEffect, useId, useState } from 'react'
import { ArrowRight, BookA, Check, Copy, Eraser, NotebookPen } from 'lucide-react'
import type { GlossaryEntry, Relation, Voice } from '@/api/types'
import { VoiceTag } from '@/components/sources/VoiceTag'
import { useTranslation, type MessageKey } from '@/i18n'
import { eyebrow } from '@/lib/styles'
import { cn } from '@/lib/utils'

const VOICE_HELP: Record<Voice, MessageKey> = {
  data: 'pedagogy.voiceDataHelp',
  interpretation: 'pedagogy.voiceInterpretationHelp',
  imagination: 'pedagogy.voiceImaginationHelp',
}

/** STORY-007, explained: what each of the three voices means, before the story starts. */
export function VoicesLegend() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="voices-legend-title" className="glass rounded-2xl p-5">
      <h2 id="voices-legend-title" className={cn(eyebrow, 'text-moon-dust')}>
        {t('pedagogy.voicesTitle')}
      </h2>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        {(Object.keys(VOICE_HELP) as Voice[]).map((voice) => (
          <div key={voice}>
            <dt>
              <VoiceTag voice={voice} />
            </dt>
            <dd className="mt-1 text-sm text-moon-dust">{t(VOICE_HELP[voice])}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * "Words to know" of one step: each word opens its definition in place (sources: About page)
 * (a native disclosure — never a hover-only tooltip).
 */
export function WordsToKnow({ words }: { words: GlossaryEntry[] }) {
  const { t } = useTranslation()
  if (words.length === 0) return null

  return (
    <aside aria-label={t('pedagogy.wordsTitle')} className="mt-6">
      <p className={cn(eyebrow, 'flex items-center gap-2 text-moon-dust')}>
        <BookA aria-hidden="true" className="size-4" />
        {t('pedagogy.wordsTitle')}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {words.map((word) => (
          <li key={word.id} className="w-full sm:w-auto">
            <details className="group rounded-2xl border border-[var(--scene-accent,var(--world-accent))]/40 bg-void/40 open:w-full sm:open:max-w-md">
              <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold">{word.label}</summary>
              <div className="space-y-2 px-4 pb-4 text-sm">
                <p>{word.definition}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </aside>
  )
}

const notebookKey = (storyId: string) => `aeroreborn.notebook.${storyId}`

function readNote(storyId: string): string {
  try {
    return window.localStorage.getItem(notebookKey(storyId)) ?? ''
  } catch {
    return ''
  }
}

/**
 * "Your turn" becomes an activity: the visitor writes an answer that stays in this browser
 * only (no account, nothing sent — NFR-LEGAL-001), and can copy it.
 */
export function Logbook({ storyId }: { storyId: string }) {
  const { t } = useTranslation()
  const fieldId = useId()
  const [note, setNote] = useState(() => readNote(storyId))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      if (note) window.localStorage.setItem(notebookKey(storyId), note)
      else window.localStorage.removeItem(notebookKey(storyId))
    } catch {
      // Storage blocked: the answer lasts for this visit.
    }
  }, [note, storyId])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(note)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-labelledby={`${fieldId}-title`} className="glass mt-8 rounded-2xl p-5 sm:p-7">
      <h3 id={`${fieldId}-title`} className="flex items-center gap-2 font-heading text-xl font-bold">
        <NotebookPen aria-hidden="true" className="size-5 text-nebula-purple" />
        {t('pedagogy.notebookTitle')}
      </h3>
      <p id={`${fieldId}-hint`} className="mt-1 text-sm text-moon-dust">
        {t('pedagogy.notebookHint')}
      </p>
      <label htmlFor={fieldId} className="sr-only">
        {t('pedagogy.notebookLabel')}
      </label>
      <textarea
        id={fieldId}
        aria-describedby={`${fieldId}-hint`}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={4}
        maxLength={2000}
        className="mt-4 w-full resize-y rounded-xl border border-moon-dust/40 bg-void/60 p-4 text-base leading-relaxed placeholder:text-moon-dust/60 focus:border-nebula-purple"
        placeholder={t('pedagogy.notebookLabel')}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={!note}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-moon-dust/40 px-4 text-sm font-medium transition-colors hover:border-nebula-purple disabled:opacity-40"
        >
          {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
          {copied ? t('pedagogy.notebookCopied') : t('pedagogy.notebookCopy')}
        </button>
        <button
          type="button"
          onClick={() => setNote('')}
          disabled={!note}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-moon-dust transition-colors hover:text-starlight disabled:opacity-40"
        >
          <Eraser aria-hidden="true" className="size-4" />
          {t('pedagogy.notebookClear')}
        </button>
        {note && <output className="text-xs text-moon-dust">{t('pedagogy.notebookSaved')}</output>}
      </div>
    </section>
  )
}

/**
 * The relay drawn: who passed something on, to whom, with a signal travelling between them.
 * The names are read aloud as "From … to …" (same wording as RelationEnds).
 */
export function RelayChain({ relation }: { relation: Relation }) {
  const { t } = useTranslation()
  const from = relation.fromEntity?.name
  const to = relation.toEntity?.name
  if (!from || !to) return null

  return (
    <div className="flex items-center gap-3">
      <span className="min-w-0 flex-1 rounded-xl border border-world/40 bg-void/50 px-3 py-2 text-center font-heading text-sm font-bold sm:text-base">
        <span className="sr-only">{t('relations.from')} </span>
        {from}
      </span>
      <span aria-hidden="true" className="relative flex h-px w-12 shrink-0 items-center bg-world/50 sm:w-20">
        <span className="absolute size-2 rounded-full bg-world shadow-[0_0_10px_var(--world-accent)] motion-safe:animate-[relay_2.4s_ease-in-out_infinite]" />
        <ArrowRight className="absolute -right-2 size-4 text-world" />
      </span>
      <span className="min-w-0 flex-1 rounded-xl border border-world bg-world/10 px-3 py-2 text-center font-heading text-sm font-bold sm:text-base">
        <span className="sr-only">{t('relations.to')} </span>
        {to}
      </span>
    </div>
  )
}
