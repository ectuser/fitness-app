import { useExercises } from '../exercise/use-exercises'
import { getWorkoutTotalSets } from '../workout/workout-helpers'
import { useWorkouts } from '../workout/use-workouts'
import { DashboardHeaderActions } from './DashboardHeaderActions'
import { NextWorkoutSection } from './NextWorkoutSection'
import { QuickStatsSection } from './QuickStatsSection'
import { UpcomingWorkoutsSection } from './UpcomingWorkoutsSection'
import { useNavigate } from '@/lib/router-compat'
import { usePwaUpdateStatus } from '@/features/app-update/pwa-update-status'
import { PageHeader } from '@/components/layout/PageHeader'

export function Dashboard() {
  const navigate = useNavigate()
  const updateStatus = usePwaUpdateStatus()
  const { exercises } = useExercises()
  const hasAvailableUpdate = updateStatus.state === 'available-update'
  const { nextWorkout, upcomingWorkouts, workouts } = useWorkouts()
  const completedWorkouts = workouts.filter(
    (workout) => workout.status === 'completed',
  )

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <DashboardHeaderActions
            hasAvailableUpdate={hasAvailableUpdate}
            onCreateWorkout={() => navigate('/workouts/new')}
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
    </div>
  )
}
