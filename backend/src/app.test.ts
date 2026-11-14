import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from './app.js'

describe('API', () => {
  const app = createApp()

  it('GET /api/health reports the service as up', async () => {
    const response = await request(app).get('/api/health')
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', message: 'AeroReborn API running' })
  })

  it('returns a JSON 404 for unknown API routes', async () => {
    const response = await request(app).get('/api/does-not-exist')
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Not found' })
  })
})
