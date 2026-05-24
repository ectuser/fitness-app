import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../../../..')

function projectFileExists(path: string) {
  return existsSync(resolve(projectRoot, path))
}

describe('dashboard slice boundary', () => {
  it('owns dashboard pages, components, hooks, and domain helpers', () => {
    expect(projectFileExists('src/features/dashboard/Dashboard.tsx')).toBe(true)
    expect(
      projectFileExists('src/features/dashboard/DashboardDialogs.tsx'),
    ).toBe(true)
    expect(
      projectFileExists('src/features/dashboard/DashboardHeaderActions.tsx'),
    ).toBe(true)
    expect(
      projectFileExists('src/features/dashboard/NextWorkoutSection.tsx'),
    ).toBe(true)
    expect(
      projectFileExists('src/features/dashboard/QuickStatsSection.tsx'),
    ).toBe(true)
    expect(
      projectFileExists('src/features/dashboard/UpcomingWorkoutsSection.tsx'),
    ).toBe(true)
    expect(
      projectFileExists(
        'src/features/dashboard/use-dashboard-data-management.ts',
      ),
    ).toBe(true)
    expect(projectFileExists('src/features/dashboard/dashboard-data.ts')).toBe(
      true,
    )
  })
})
