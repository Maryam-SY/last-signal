import { brotliCompressSync, constants, gzipSync } from 'node:zlib'
import type { NextFunction, Request, Response } from 'express'

/** Responses smaller than this are sent as they are: compression would not pay for itself. */
const MIN_BYTES = 1024

/**
 * Compresses JSON responses with Brotli or gzip, whichever the client accepts (Brotli first:
 * the content pages weigh 100–180 kB raw and shrink 4–5×). Built on Node's own zlib — no
 * dependency (team decision of 2026-11-15; CLAUDE.md §6). Content is static per deployment,
 * so compressing synchronously per response is fine at this size; a cache in front (or the
 * host's own compression, OPEN-05) can take over later without changing the API.
 */
export function compressJson(req: Request, res: Response, next: NextFunction): void {
  const original = res.json.bind(res)
  res.json = ((body: unknown) => {
    const accept = req.headers['accept-encoding']
    const accepted = typeof accept === 'string' ? accept : ''
    const text = JSON.stringify(body)
    const encoding = /\bbr\b/.test(accepted) ? 'br' : /\bgzip\b/.test(accepted) ? 'gzip' : null
    if (!encoding || Buffer.byteLength(text) < MIN_BYTES) return original(body)
    const buffer = Buffer.from(text)
    const compressed = encoding === 'br' ? brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }) : gzipSync(buffer, { level: 6 })
    res.set('Content-Encoding', encoding)
    res.set('Vary', 'Accept-Encoding')
    res.set('Content-Type', 'application/json; charset=utf-8')
    res.removeHeader('Content-Length')
    res.end(compressed)
    return res
  }) as Response['json']
  next()
}
