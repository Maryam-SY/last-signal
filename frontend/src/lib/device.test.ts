import { afterEach, describe, expect, it, vi } from 'vitest'
import { appleTouchDevice, canUseWebGL } from './device'

function fakeNavigator(userAgent: string, platform = '', maxTouchPoints = 0) {
  vi.stubGlobal('navigator', { userAgent, platform, maxTouchPoints })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('device', () => {
  it('recognises iPhone and iPad (also iPadOS posing as a Mac) and gives them no WebGL', () => {
    vi.stubGlobal('WebGLRenderingContext', function WebGLRenderingContext() {})
    fakeNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1')
    expect(appleTouchDevice()).toBe(true)
    expect(canUseWebGL()).toBe(false)
    fakeNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 'MacIntel', 5)
    expect(appleTouchDevice()).toBe(true)
  })

  it('keeps WebGL on Android and on computers', () => {
    vi.stubGlobal('WebGLRenderingContext', function WebGLRenderingContext() {})
    fakeNavigator('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36', 'Linux armv8l', 5)
    expect(canUseWebGL()).toBe(true)
    fakeNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15', 'MacIntel', 0)
    expect(canUseWebGL()).toBe(true)
  })
})
