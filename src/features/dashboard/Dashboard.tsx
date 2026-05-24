import { PageHeader } from '@/components/layout/PageHeader'
import { useNavigate } from '@/lib/router-compat'
import { useExercises } from '../exercise/use-exercises'
import { useSettings } from '../settings/use-settings'
import { getWorkoutTotalSets } from '../workout/workout-helpers'
import { useWorkouts } from '../workout/use-workouts'
import { DashboardDialogs } from './DashboardDialogs'
import { DashboardHeaderActions } from './DashboardHeaderActions'
import { NextWorkoutSection } from './NextWorkoutSection'
import { QuickStatsSection } from './QuickStatsSection'
import { UpcomingWorkoutsSection } from './UpcomingWorkoutsSection'
import { useDashboardDataManagement } from './use-dashboard-data-management'

export function Dashboard() {
  const navigate = useNavigate()
  const { exercises } = useExercises()
  const { nextWorkout, upcomingWorkouts, workouts } = useWorkouts()
  const { settings } = useSettings()
  const {
    closeImportDialog,
    fileInputRef,
    handleConfirmImport,
    handleExportData,
    handleFileChange,
    handleImportClick,
    handleResetData,
    importError,
    setShowResetDialog,
    showImportDialog,
    showResetDialog,
  } = useDashboardDataManagement({
    exercises,
    workouts,
    settings,
  })

  const completedWorkouts = workouts.filter((workout) => workout.isCompleted)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <DashboardHeaderActions
            fileInputRef={fileInputRef}
            onCreateWorkout={() => navigate('/workouts/new')}
            onExportData={handleExportData}
            onFileChange={handleFileChange}
            onImportClick={handleImportClick}
            onOpenResetDialog={() => setShowResetDialog(true)}
          />
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <NextWorkoutSection
          exercises={exercises}
          nextWorkout={nextWorkout}
          onCreateWorkout={() => navigate('/workouts/new')}
          onStartWorkout={(workoutId) =>
            navigate(`/workouts/${workoutId}/session`)
          }
        />
        <UpcomingWorkoutsSection
          exercises={exercises}
          workouts={upcomingWorkouts}
          onShowAll={() => navigate('/workouts')}
          onStartWorkout={(workoutId) =>
            navigate(`/workouts/${workoutId}/session`)
          }
        />
        <QuickStatsSection
          exercisesCount={exercises.length}
          upcomingWorkoutsCount={upcomingWorkouts.length}
          completedWorkoutsCount={completedWorkouts.length}
          totalSets={completedWorkouts.reduce(
            (sum, workout) => sum + getWorkoutTotalSets(workout),
            0,
          )}
        />
      </div>

      <DashboardDialogs
        importError={importError}
        onCloseImportDialog={closeImportDialog}
        onConfirmImport={handleConfirmImport}
        onConfirmReset={handleResetData}
        openImportDialog={showImportDialog}
        openResetDialog={showResetDialog}
        setOpenResetDialog={setShowResetDialog}
      />
    </div>
  )
}
