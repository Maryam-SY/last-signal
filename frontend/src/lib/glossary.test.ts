import { describe, expect, it } from 'vitest'
import type { GlossaryEntry } from '@/api/types'
import { wordsIn } from './glossary'

const entry = (id: string, en: string[], fr: string[]): GlossaryEntry => ({
  id,
  status: 'draft',
  terms: { en, fr },
  label: id,
  definition: `Definition of ${id}.`,
  sourceIds: ['src-1'],
  sources: [],
})

const glossary = [entry('rover', ['rover', 'rovers'], ['rover']), entry('seismometer', ['seismometer'], ['sismomètre'])]

describe('wordsIn', () => {
  it('finds whole words in any case, in glossary order', () => {
    expect(wordsIn(['A SEISMOMETER and two Rovers.'], glossary, 'en').map((g) => g.id)).toEqual(['rover', 'seismometer'])
  })

  it('ignores a word that is only part of a longer word', () => {
    expect(wordsIn(['The roverish design.'], glossary, 'en')).toEqual([])
  })

  it('uses the forms of the current language, accents included', () => {
    expect(wordsIn(['Un sismomètre « écoute ».'], glossary, 'fr').map((g) => g.id)).toEqual(['seismometer'])
    expect(wordsIn(['Un sismomètre « écoute ».'], glossary, 'en')).toEqual([])
  })
})
