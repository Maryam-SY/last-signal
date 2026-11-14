import { describe, expect, it } from 'vitest'
import type { Machine, Media, MissionDetail } from '@/api/types'
import { bestStill, machineChapters, machineCover, missionCover, modelOf, sceneMotion } from './journey'

const media = (id: string, extra: Partial<Media> = {}): Media => ({
  id,
  type: 'image',
  url: `https://example.org/${id}.jpg`,
  pageUrl: `https://example.org/${id}`,
  title: null,
  caption: null,
  alt: `Alt ${id}`,
  credit: 'Test',
  license: 'Test',
  depiction: 'photo',
  missionIds: ['m'],
  machineIds: ['rover'],
  sourceId: 's',
  ...extra,
})

const machine = { id: 'rover' } as Machine
const mission = (timeline: MissionDetail['timeline'], all: Media[]) => ({ timeline, media: all }) as MissionDetail
const event = (id: string, items: Media[]) => ({
  id,
  date: { value: '2004-01-04', sourceIds: ['s'] },
  title: `Title ${id}`,
  description: `Text ${id}`,
  mediaIds: items.map((item) => item.id),
  media: items,
})

describe('journey helpers', () => {
  it('prefers a real photo over an artist view', () => {
    expect(bestStill([media('art', { depiction: 'artwork' }), media('photo')])?.id).toBe('photo')
    expect(bestStill([media('video', { type: 'video' })])).toBeUndefined()
  })

  it('builds chapters from the timeline steps that show the machine, in order', () => {
    const other = media('other', { machineIds: ['lander'] })
    const chapters = machineChapters(
      machine,
      mission([event('a', [other]), event('b', [media('b1')]), event('c', [media('c1', { depiction: 'artwork' })])], []),
      undefined,
    )
    expect(chapters.map((c) => [c.id, c.title, c.text, c.media.id])).toEqual([
      ['b', 'Title b', 'Text b', 'b1'],
      ['c', 'Title c', 'Text c', 'c1'],
    ])
  })

  it('falls back to other photos of the machine, described by their alt text', () => {
    const cover = media('cover')
    const chapters = machineChapters(machine, mission([], [cover, media('p2'), media('model', { type: '3d-model' })]), cover)
    expect(chapters).toEqual([expect.objectContaining({ id: 'p2', date: null, text: 'Alt p2' })])
  })

  it('does not reuse the mission photo for a machine that has another photo', () => {
    const shared = media('shared')
    const own = media('own')
    const all = mission([], [shared, own])
    expect(missionCover(all)?.id).toBe('shared')
    expect(machineCover(all, 'rover')?.id).toBe('own')
  })

  it('keeps the mission photo when it is the only photo of the machine, and prefers it to a drawing', () => {
    const shared = media('shared')
    expect(machineCover(mission([], [shared]), 'rover')?.id).toBe('shared')
    expect(machineCover(mission([], [shared, media('drawing', { depiction: 'artwork' })]), 'rover')?.id).toBe('shared')
    expect(machineCover(mission([], [media('drawing', { depiction: 'artwork' })]), 'rover')?.id).toBe('drawing')
  })

  it('prefers a still photo to an animation for the machine', () => {
    const gif = media('gif', { type: 'animation' })
    expect(machineCover(mission([], [media('opening', { machineIds: [] }), gif, media('still')]), 'rover')?.id).toBe('still')
  })

  it('prefers a photo of the machine alone to one shared with another machine', () => {
    const shared = media('shared', { machineIds: ['rover', 'lander'] })
    expect(machineCover(mission([], [media('opening', { machineIds: [] }), shared, media('alone')]), 'rover')?.id).toBe('alone')
    expect(machineCover(mission([], [media('opening', { machineIds: [] }), shared]), 'rover')?.id).toBe('shared')
  })

  it('avoids a picture the mission log already told, unless it is the only one (US-5.9)', () => {
    const opening = media('opening', { machineIds: [] })
    const told = media('told')
    const fresh = media('fresh')
    expect(machineCover(mission([], [opening, told, fresh]), 'rover', new Set(['told']))?.id).toBe('fresh')
    expect(machineCover(mission([], [opening, told]), 'rover', new Set(['told']))?.id).toBe('told')
  })

  it('finds a .glb 3D model of the machine and ignores embedded model pages', () => {
    const glb = media('glb', { type: '3d-model', url: 'https://example.org/models/Rover%20Model.glb' })
    const embed = media('embed', { type: '3d-model', url: 'https://example.org/gltf_embed/25043' })
    expect(modelOf(mission([], [media('p'), embed, glb]), 'rover')?.id).toBe('glb')
    expect(modelOf(mission([], [embed]), 'rover')).toBeUndefined()
  })

  it('maps the scroll position to enter, progress and exit', () => {
    const before = sceneMotion({ top: 1000, bottom: 3000, height: 2000 }, 800)
    expect(before.enter).toBe(0)
    const inside = sceneMotion({ top: -600, bottom: 1400, height: 2000 }, 800)
    expect(inside.enter).toBe(1)
    expect(inside.progress).toBeCloseTo(0.5)
    expect(inside.exit).toBe(0)
    const leaving = sceneMotion({ top: -2000, bottom: 0, height: 2000 }, 800)
    expect(leaving.exit).toBe(1)
  })
})
