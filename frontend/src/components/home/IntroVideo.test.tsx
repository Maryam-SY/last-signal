import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/i18n'
import { IntroVideo } from './IntroVideo'

/** A browser that refuses sound until a gesture: resume() only works once `unlocked`. */
let unlocked = false
const speak = vi.fn()

class FakeNode {
  gain = { value: 1, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() }
  frequency = { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
  type = ''
  buffer: unknown = null
  connect(node: unknown) {
    return node
  }
  start() {}
  stop() {}
}

class FakeAudioContext {
  state: 'suspended' | 'running' = 'suspended'
  currentTime = 0
  sampleRate = 8000
  destination = new FakeNode()
  resume() {
    if (unlocked) this.state = 'running'
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
  createGain = () => new FakeNode()
  createOscillator = () => new FakeNode()
  createBiquadFilter = () => new FakeNode()
  createConvolver = () => new FakeNode()
  createBuffer = (_channels: number, length: number) => ({ getChannelData: () => new Float32Array(length) })
}

beforeEach(() => {
  unlocked = false
  speak.mockClear()
  vi.stubGlobal('AudioContext', FakeAudioContext)
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn(), getVoices: () => [] })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('intro video', () => {
  it('offers a button when the browser blocks sound, and plays the soundtrack once clicked', async () => {
    render(
      <I18nProvider initialLocale="en">
        <IntroVideo onReveal={() => {}} onDone={() => {}} />
      </I18nProvider>,
    )
    const button = await screen.findByRole('button', { name: 'Turn sound on' })
    unlocked = true
    await userEvent.click(button)
    expect(screen.queryByRole('button', { name: 'Turn sound on' })).not.toBeInTheDocument()
    // No voice-off: the intro only has its soundtrack (team decision 2026-11-15).
    expect(speak).not.toHaveBeenCalled()
  })
})
