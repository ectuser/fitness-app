import { describe, expect, it } from 'vitest'
import { getRouterBasepath } from '@/router'

describe('getRouterBasepath', () => {
  it('keeps root builds at the root route basepath', () => {
    expect(getRouterBasepath('/')).toBe('/')
  })

  it('removes the trailing slash from GitHub Pages base paths', () => {
    expect(getRouterBasepath('/fitness-app/')).toBe('/fitness-app')
    expect(getRouterBasepath('/fitness-app/pr-20/')).toBe('/fitness-app/pr-20')
  })
})
