import { useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useLocation } from 'react-router'
import { useTranslation } from '@/i18n'
import { glide, isSoundAvailable, setSound } from '@/lib/ambientSound'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'orbemoria.sound'

function storedChoice(): boolean {
  try {
    // US-5.15: on by default; only an explicit choice turns it off.
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return false
  }
}

/**
 * Header switch for the space sound (US-5.12). Off by default; the visitor's choice is
 * remembered. A remembered "on" waits for the first click or key press (browsers block sound
 * before that), then fades in. A soft rising glide plays when the visitor flies to another page.
 */
export function SoundToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [on, setOn] = useState(false)
  const available = isSoundAvailable()

  // Remembered "on": start on the visitor's first gesture.
  useEffect(() => {
    if (!available || !storedChoice()) return
    const start = () => {
      setOn(true)
      void setSound(true)
    }
    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [available])

  useEffect(() => {
    glide()
  }, [pathname])

  if (!available) return null

  const toggle = () => {
    const next = !on
    setOn(next)
    void setSound(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    } catch {
      // The choice lasts for this visit only.
    }
  }

  const Icon = on ? Volume2 : VolumeX
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={toggle}
      title={t('sound.label')}
      className={cn(
        'relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-moon-dust transition-colors hover:text-starlight aria-pressed:text-cosmic-cyan',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
      {on && <span aria-hidden="true" className="sound-wave absolute inset-1 rounded-full border border-cosmic-cyan/50" />}
      <span className="sr-only">{t('sound.label')}</span>
    </button>
  )
}
