import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from '@/lib/settings'

describe('settings constants', () => {
  it('exports the default settings', () => {
    expect(DEFAULT_SETTINGS).toEqual({ defaultWeightUnit: 'kg' })
  })
})
