import { Router, type Request, type Response } from 'express'
import { isLang, localize } from '../content/localize.js'
import type { ContentRepository } from '../content/repository.js'
import { MEDIA_TYPES, type Lang } from '../content/types.js'

/** `?lang=fr|en`, defaulting to English (OPEN-06). */
function langOf(req: Request): Lang {
  return isLang(req.query.lang) ? req.query.lang : 'en'
}

function stringParam(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function send<T>(req: Request, res: Response, data: T | null, what: string) {
  if (data === null) {
    res.status(404).json({ error: `${what} not found` })
    return
  }
  res.json(localize(data, langOf(req)))
}

/**
 * Read-only content API. Contract documented in docs/architecture/ARCHITECTURE.md §16.
 * All responses are localized with ?lang=en|fr.
 */
export function contentRouter(repo: ContentRepository): Router {
  const router = Router()

  router.get('/destinations', (req, res) => send(req, res, repo.listDestinations(), 'Destinations'))
  router.get('/destinations/:id', (req, res) => send(req, res, repo.getDestination(req.params.id), 'Destination'))
  router.get('/missions/:id', (req, res) => send(req, res, repo.getMission(req.params.id), 'Mission'))
  router.get('/machines/:id', (req, res) => send(req, res, repo.getMachine(req.params.id), 'Machine'))
  router.get('/stories', (req, res) => send(req, res, repo.listStories(), 'Stories'))
  router.get('/stories/:id', (req, res) => send(req, res, repo.getStory(req.params.id), 'Story'))
  router.get('/relations', (req, res) => send(req, res, repo.listRelations(), 'Relations'))
  router.get('/sources', (req, res) => send(req, res, repo.listSources(), 'Sources'))
  router.get('/sources/:id', (req, res) => send(req, res, repo.getSource(req.params.id), 'Source'))

  router.get('/media', (req, res) => {
    const type = stringParam(req.query.type)
    if (type && !(MEDIA_TYPES as readonly string[]).includes(type)) {
      res.status(400).json({ error: `Unknown media type "${type}". Expected one of: ${MEDIA_TYPES.join(', ')}` })
      return
    }
    const filter = {
      ...(stringParam(req.query.missionId) ? { missionId: stringParam(req.query.missionId) } : {}),
      ...(stringParam(req.query.machineId) ? { machineId: stringParam(req.query.machineId) } : {}),
      ...(type ? { type } : {}),
    }
    send(req, res, repo.listMedia(filter), 'Media')
  })

  return router
}
