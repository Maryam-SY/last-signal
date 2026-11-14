import type { StepKey } from '@/api/types'

/** Anchor id of a step's scene (step-1 … step-6). */
export const stepSectionId = (number: number) => `step-${number}`

/**
 * Ambient colour of each narrative step (interface cue only, US-5.6). All COSMOS accents,
 * each ≥ 7:1 on Void Black, so they can also colour the step labels.
 */
export const STEP_ACCENT: Record<StepKey, string> = {
  signal: 'var(--cosmos-stellar-cyan)',
  why: 'var(--cosmos-cosmic-indigo)',
  how: 'var(--cosmos-nebula-purple)',
  discovery: 'var(--cosmos-stellar-gold)',
  relay: 'var(--cosmos-stellar-cyan)',
  'your-turn': 'var(--cosmos-nebula-purple)',
}
