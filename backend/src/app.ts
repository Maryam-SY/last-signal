import cors from 'cors'
import express, { type Express } from 'express'

/**
 * Builds the Express application without listening, so tests can exercise it directly.
 * Business endpoints are not defined yet: the backend's functional role is OPEN-18
 * (docs/project/AUDIT_PHASE0.md).
 */
export function createApp(): Express {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'AeroReborn API running' })
  })

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
