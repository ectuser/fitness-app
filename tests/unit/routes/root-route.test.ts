import { describe, expect, it } from 'vitest'
import { isRestorableRoute } from '@/routes/__root'

describe('root route restoration', () => {
  it('does not include the App Update Page in last visited route restoration', () => {
    expect(isRestorableRoute('/app-update')).toBe(false)
    expect(isRestorableRoute('/workouts')).toBe(true)
  })
})
