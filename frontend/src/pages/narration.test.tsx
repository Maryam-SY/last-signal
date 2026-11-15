import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderRoute } from '@/test/renderRoute'

/** A fake browser voice: utterances are queued, the test plays their events by hand. */
class FakeUtterance {
  lang = ''
  rate = 1
  voice: unknown = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  onboundary: ((event: { name?: string; charIndex: number; charLength?: number }) => void) | null = null
  constructor(public text: string) {}
}

let spoken: FakeUtterance[] = []
const cancel = vi.fn()
const scrollTo = vi.fn()

beforeEach(() => {
  spoken = []
  cancel.mockClear()
  scrollTo.mockClear()
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  vi.stubGlobal('speechSynthesis', { speak: (u: FakeUtterance) => spoken.push(u), cancel, getVoices: () => [] })
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo
})

/** The voice starts the utterance it was last given. */
const startLast = () => spoken.at(-1)!.onstart!()
const endLast = () => spoken.at(-1)!.onend!()

describe('narration follows the reading (US-5.12)', () => {
  it('reads the texts of the page in order, lights the one being read and scrolls to it', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars/machine-a')
    const title = await screen.findByRole('heading', { level: 1, name: 'Test Rover' })
    await user.click(screen.getByRole('button', { name: 'Listen to its story' }))

    expect(spoken[0]!.text).toBe('Test Rover')
    startLast()
    expect(title).toHaveAttribute('data-narrating')
    expect(scrollTo).toHaveBeenCalled()

    endLast()
    expect(spoken[1]!.text).toBe('It found traces of ancient water.')
    startLast()
    expect(title).not.toHaveAttribute('data-narrating')
    expect(screen.getByText('It found traces of ancient water.')).toHaveAttribute('data-narrating')

    // The figures of its life are read with their label.
    endLast()
    startLast()
    expect(spoken.map((u) => u.text)).toContain('How long Test Rover lived')
    while (!spoken.at(-1)!.text.startsWith('Planned life')) {
      endLast()
      startLast()
    }
    expect(spoken.at(-1)!.text).toBe('Planned life : 90 Martian days.')
  })

  it('marks the word being spoken, where the browser allows it', async () => {
    const user = userEvent.setup()
    const highlights = new Map<string, { ranges: Range[] }>()
    vi.stubGlobal('CSS', { highlights })
    vi.stubGlobal(
      'Highlight',
      class {
        ranges: Range[]
        constructor(...ranges: Range[]) {
          this.ranges = ranges
        }
      },
    )
    renderRoute('/explore/mars/machine-a')
    await screen.findByRole('heading', { level: 1, name: 'Test Rover' })
    await user.click(screen.getByRole('button', { name: 'Listen to its story' }))
    // The decoded title speaks its own text (not in place); the summary paragraph is in place.
    startLast()
    endLast()
    startLast()
    spoken[1]!.onboundary!({ name: 'word', charIndex: 3, charLength: 5 })
    expect(highlights.get('narration-word')!.ranges[0]!.toString()).toBe('found')
  })

  it('lets the visitor scroll by hand, and can be stopped from the bar that stays on screen', async () => {
    const user = userEvent.setup()
    renderRoute('/explore/mars/machine-a')
    await screen.findByRole('heading', { level: 1, name: 'Test Rover' })
    await user.click(screen.getByRole('button', { name: 'Listen to its story' }))
    startLast()
    scrollTo.mockClear()

    fireEvent.wheel(window)
    endLast()
    startLast()
    expect(scrollTo).not.toHaveBeenCalled()

    expect(screen.getByText('Reading aloud')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Stop' }))
    expect(cancel).toHaveBeenCalled()
    expect(document.querySelector('[data-narrating]')).toBeNull()
    expect(screen.queryByText('Reading aloud')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Listen to its story' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reads a 6-step story from its title through its steps', async () => {
    const user = userEvent.setup()
    renderRoute('/stories/story-a')
    await user.click(await screen.findByRole('button', { name: 'Listen to its story' }))
    const first = spoken[0]!.text
    expect(first).toBe(screen.getByRole('heading', { level: 1 }).textContent)
    endLast()
    expect(spoken[1]!.text).toBe(document.getElementById('step-1-title')!.textContent)
  })
})
