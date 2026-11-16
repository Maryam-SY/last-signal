import type { StepKey } from '@/api/types'

/** Anchor id of a step's scene (step-1 … step-6). */
export const stepSectionId = (number: number) => `step-${number}`

/**
 * Ambient colour of each narrative step (interface cue only, US-5.6). All ORBEMORIA accents,
 * each ≥ 6:1 on Midnight Universe, so they can also colour the step labels.
 */
export const STEP_ACCENT: Record<StepKey, string> = {
  signal: 'var(--orbemoria-cosmic-cyan)',
  why: 'var(--orbemoria-ice-cyan)',
  how: 'var(--orbemoria-archive-lavender)',
  discovery: 'var(--orbemoria-pale-gold)',
  relay: 'var(--orbemoria-cosmic-cyan)',
  'your-turn': 'var(--orbemoria-archive-lavender)',
}
