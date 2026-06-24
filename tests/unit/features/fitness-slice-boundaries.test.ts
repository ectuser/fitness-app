import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = resolve(__dirname, '../../..')

const obsoleteHorizontalEntrypoints = [
  'src/components/workout/SetInput.tsx',
  'src/components/workout/WorkoutCard.tsx',
  'src/components/workout/WorkoutExerciseCard.tsx',
  'src/components/workout/WorkoutExerciseList.tsx',
  'src/components/workout/WorkoutList.tsx',
  'src/components/workout/WorkoutMenu.tsx',
  'src/hooks/useFitnessDataQueries.ts',
  'src/hooks/useWorkoutCreateDraft.ts',
  'src/hooks/useWorkoutExerciseEditor.ts',
  'src/lib/workout-create-draft.ts',
  'src/lib/workout-editor.ts',
  'src/lib/workouts.ts',
  'src/pages/WorkoutEditPage.tsx',
  'src/pages/WorkoutSessionPage.tsx',
  'src/pages/WorkoutsCompletedPage.tsx',
  'src/pages/WorkoutsPage.tsx',
] as const

const featureFiles = [
  'src/features/dashboard/Dashboard.tsx',
  'src/features/dashboard/DashboardHeaderActions.tsx',
  'src/features/dashboard/NextWorkoutSection.tsx',
  'src/features/dashboard/QuickStatsSection.tsx',
  'src/features/dashboard/UpcomingWorkoutsSection.tsx',
  'src/features/dashboard/dashboard-data.ts',
  'src/features/exercise/ExerciseDetailPage.tsx',
  'src/features/exercise/ExerciseForm.tsx',
  'src/features/exercise/ExerciseFormPage.tsx',
  'src/features/exercise/ExerciseSelector.tsx',
  'src/features/exercise/ExercisesPage.tsx',
  'src/features/exercise/exercise-helpers.ts',
  'src/features/exercise/exercise-mutations.ts',
  'src/features/exercise/exercise-queries.ts',
  'src/features/exercise/exercise-source.ts',
  'src/features/exercise/use-exercises.ts',
  'src/features/training-history/training-history-projections.ts',
  'src/features/training-history/use-training-history.ts',
  'src/features/settings/AppUpdateSettingsSection.tsx',
  'src/features/settings/AppearanceSettingsSection.tsx',
  'src/features/settings/DataSettingsSection.tsx',
  'src/features/settings/SettingsDataDialogs.tsx',
  'src/features/settings/SettingsPage.tsx',
  'src/features/settings/SettingsSectionNav.tsx',
  'src/features/settings/use-settings-data-management.ts',
  'src/features/workout/SetInput.tsx',
  'src/features/workout/WorkoutCard.tsx',
  'src/features/workout/WorkoutEditPage.tsx',
  'src/features/workout/WorkoutExerciseCard.tsx',
  'src/features/workout/WorkoutExerciseList.tsx',
  'src/features/workout/WorkoutList.tsx',
  'src/features/workout/WorkoutMenu.tsx',
  'src/features/workout/WorkoutSessionPage.tsx',
  'src/features/workout/WorkoutsCompletedPage.tsx',
  'src/features/workout/WorkoutsPage.tsx',
  'src/features/workout/use-workout-create-draft.ts',
  'src/features/workout/use-workout-exercise-editor.ts',
  'src/features/workout/workout-create-draft.ts',
  'src/features/workout/workout-editor.ts',
  'src/features/workout/workout-helpers.ts',
  'src/features/workout/workout-mutations.ts',
  'src/features/workout/workout-queries.ts',
  'src/features/workout/workout-source.ts',
] as const

function projectPath(path: string) {
  return resolve(projectRoot, path)
}

function fileExists(path: string) {
  return existsSync(projectPath(path))
}

function relativeImport(fromFile: string, toFile: string) {
  const fromDir = dirname(projectPath(fromFile))
  const target = projectPath(toFile).replace(/\.(ts|tsx)$/, '')
  let specifier = relative(fromDir, target)

  if (!specifier.startsWith('.')) {
    specifier = `./${specifier}`
  }

  return specifier
}

describe('fitness slice boundaries', () => {
  it('does not keep legacy horizontal fitness entrypoints', () => {
    expect(
      obsoleteHorizontalEntrypoints.filter((path) => fileExists(path)),
    ).toEqual([])
  })

  it('keeps feature-to-feature and feature-internal imports relative', () => {
    const invalidImports: Array<{ actual: string; expected: string }> = []

    for (const file of featureFiles) {
      const source = readFileSync(projectPath(file), 'utf8')

      for (const target of featureFiles) {
        if (target === file) {
          continue
        }

        const aliasImport = target
          .replace(/^src/, '@')
          .replace(/\.(ts|tsx)$/, '')

        if (source.includes(`from '${aliasImport}'`)) {
          invalidImports.push({
            actual: aliasImport,
            expected: relativeImport(file, target),
          })
        }
      }
    }

    expect(invalidImports).toEqual([])
  })

  it('keeps workout editing independent from training history projections', () => {
    const source = readFileSync(
      projectPath('src/features/workout/workout-editor.ts'),
      'utf8',
    )

    expect(source).not.toContain('../training-history/')
  })
})
