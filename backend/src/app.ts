import cors from 'cors'
import express, { type Express } from 'express'
import { loadContent } from './content/load.js'
import { ContentRepository } from './content/repository.js'
import type { Content } from './content/types.js'
import { validateContent } from './content/validate.js'
import { contentRouter } from './routes/content.js'

export interface AppOptions {
  /** Content to serve; defaults to the files in backend/content (or $CONTENT_DIR). */
  content?: Content
}

export class InvalidContentError extends Error {
  constructor(public readonly errors: string[]) {
    super(`Content is invalid (${errors.length} error(s)):\n- ${errors.join('\n- ')}`)
    this.name = 'InvalidContentError'
  }
}

/**
 * Builds the Express application without listening, so tests can exercise it directly.
 * Refuses to start on invalid content: no unsourced or inconsistent fact can be served.
 */
export function createApp(options: AppOptions = {}): Express {
  const content = options.content ?? loadContent()
  const { errors } = validateContent(content)
  if (errors.length > 0) throw new InvalidContentError(errors)

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'AeroReborn API running' })
  })

  app.use('/api', contentRouter(new ContentRepository(content)))

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
