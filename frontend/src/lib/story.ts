export const STORY_STEP_COUNT = 6

/** `?step` → 1..6; anything missing or invalid shows step 1 (US-4.1). */
export function parseStep(value: string | null): number {
  const step = Number(value)
  return Number.isInteger(step) && step >= 1 && step <= STORY_STEP_COUNT ? step : 1
}
