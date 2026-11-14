import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { eyebrow as eyebrowClass } from '@/lib/styles'
import { cn } from '@/lib/utils'

interface SceneProps {
  id: string
  eyebrow: string
  title: string
  intro?: string
  className?: string
  children: ReactNode
}

/** One full-height chapter of a destination's descent: eyebrow, title, intro, content. */
export function Scene({ id, eyebrow, title, intro, className, children }: SceneProps) {
  const titleId = `${id}-title`
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn('mx-auto flex min-h-[85dvh] max-w-6xl scroll-mt-20 flex-col justify-center px-5 py-20', className)}
    >
      <Reveal>
        <p className={cn(eyebrowClass, 'text-world')}>{eyebrow}</p>
        <h2 id={titleId} tabIndex={-1} className="mt-2 font-heading text-4xl font-bold outline-none sm:text-5xl">
          {title}
        </h2>
        {intro && <p className="mt-3 max-w-2xl text-moon-dust sm:text-lg">{intro}</p>}
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  )
}
