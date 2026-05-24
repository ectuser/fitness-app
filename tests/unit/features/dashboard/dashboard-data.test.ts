import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildExportPayload,
  importDashboardData,
  parseImportPayload,
  resetDashboardData,
} from '@/features/dashboard/dashboard-data'
import { STORAGE_KEYS } from '@/lib/storage'
import { DEFAULT_SETTINGS } from '@/features/settings/settings-source'
import { exercises, upcomingWorkout } from '../../fixtures'

describe('dashboard helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds export payloads with metadata', () => {
    expect(
      buildExportPayload(
        {
          exercises,
          workouts: [upcomingWorkout],
          settings: { defaultWeightUnit: 'kg' },
        },
        '2026-04-25T12:00:00.000Z',
      ),
    ).toEqual({
      version: '1.0',
      exportDate: '2026-04-25T12:00:00.000Z',
      data: {
        exercises,
        workouts: [upcomingWorkout],
        settings: { defaultWeightUnit: 'kg' },
      },
    })
  })

  it('parses valid import payloads and rejects invalid input', () => {
    expect(
      parseImportPayload(
        JSON.stringify({
          data: {
            exercises,
            workouts: [upcomingWorkout],
          },
        }),
      ),
    ).toEqual({
      exercises,
      workouts: [upcomingWorkout],
    })

    expect(() => parseImportPayload('not-json')).toThrow(
      "Failed to read backup file. Please make sure it's a valid JSON file.",
    )
    expect(() =>
      parseImportPayload(JSON.stringify({ data: { exercises } })),
    ).toThrow('Invalid backup file format. Missing required data.')
  })

  it('imports dashboard backup data while preserving backup format compatibility', () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ defaultWeightUnit: 'lb' }),
    )

    importDashboardData({
      exercises,
      workouts: [upcomingWorkout],
    })

    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]'),
    ).toEqual(exercises)
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS) ?? '[]'),
    ).toEqual([upcomingWorkout])
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null'),
    ).toEqual({
      defaultWeightUnit: 'lb',
    })

    importDashboardData({
      exercises,
      workouts: [],
      settings: DEFAULT_SETTINGS,
    })

    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null'),
    ).toEqual(DEFAULT_SETTINGS)
  })

  it('resets dashboard data by restoring seeds and clearing workouts and drafts', () => {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises))
    localStorage.setItem(
      STORAGE_KEYS.WORKOUTS,
      JSON.stringify([upcomingWorkout]),
    )
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ defaultWeightUnit: 'lb' }),
    )
    localStorage.setItem(
      STORAGE_KEYS.WORKOUT_CREATE_DRAFT,
      JSON.stringify({ name: 'Draft' }),
    )

    const resetState = resetDashboardData()

    expect(localStorage.getItem(STORAGE_KEYS.WORKOUT_CREATE_DRAFT)).toBeNull()
    expect(resetState.exercises).toEqual(expect.any(Array))
    expect(resetState.workouts).toEqual([])
    expect(resetState.settings).toEqual(DEFAULT_SETTINGS)
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) ?? '[]'),
    ).toEqual(resetState.exercises)
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKOUTS) ?? 'null'),
    ).toEqual([])
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? 'null'),
    ).toEqual(DEFAULT_SETTINGS)
  })
})
