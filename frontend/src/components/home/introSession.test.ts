import { describe, expect, it, vi } from 'vitest'
import { introPlaying, onIntroEnd, setIntroPlaying } from './introSession'

describe('intro signal (the 3D globes wait for the intro to end)', () => {
  it('tells the waiting globes when the intro ends, once they listen', () => {
    setIntroPlaying(true)
    expect(introPlaying()).toBe(true)
    const listener = vi.fn()
    const stop = onIntroEnd(listener)
    setIntroPlaying(false)
    expect(introPlaying()).toBe(false)
    expect(listener).toHaveBeenCalledTimes(1)
    stop()
    setIntroPlaying(true)
    setIntroPlaying(false)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
