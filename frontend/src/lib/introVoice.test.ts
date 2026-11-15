import { afterEach, describe, expect, it, vi } from 'vitest'
import { introVoiceUrl, playIntroLine } from './introVoice'

class FakeAudio {
  static created: FakeAudio[] = []
  static playResult: () => Promise<void> = () => Promise.resolve()
  listeners: Record<string, () => void> = {}
  paused = false
  constructor(public src: string) {
    FakeAudio.created.push(this)
  }
  addEventListener(type: string, listener: () => void) {
    this.listeners[type] = listener
  }
  removeEventListener(type: string) {
    delete this.listeners[type]
  }
  play() {
    return FakeAudio.playResult()
  }
  pause() {
    this.paused = true
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  FakeAudio.created = []
  FakeAudio.playResult = () => Promise.resolve()
})

describe('intro voice', () => {
  it('names one clip per language and line', () => {
    expect(introVoiceUrl('fr', 2)).toBe('/media/voice/intro-fr-2.mp3')
    expect(introVoiceUrl('en', 'finale')).toBe('/media/voice/intro-en-finale.mp3')
  })

  it('plays the recording and stops it on demand, without the fallback', async () => {
    vi.stubGlobal('Audio', FakeAudio)
    const fallBack = vi.fn()
    const stop = playIntroLine('en', 1, fallBack)
    await Promise.resolve()
    expect(FakeAudio.created[0]?.src).toBe('/media/voice/intro-en-1.mp3')
    stop()
    expect(FakeAudio.created[0]?.paused).toBe(true)
    expect(fallBack).not.toHaveBeenCalled()
  })

  it('falls back once when the clip is missing, then stops asking for it', async () => {
    vi.stubGlobal('Audio', FakeAudio)
    FakeAudio.playResult = () => Promise.reject(Object.assign(new Error('no source'), { name: 'NotSupportedError' }))
    const fallBack = vi.fn()
    playIntroLine('fr', 3, fallBack)
    FakeAudio.created[0]?.listeners.error?.()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(fallBack).toHaveBeenCalledTimes(1)

    const again = vi.fn()
    playIntroLine('fr', 3, again)
    expect(again).toHaveBeenCalledTimes(1)
    expect(FakeAudio.created).toHaveLength(1)
  })
})
