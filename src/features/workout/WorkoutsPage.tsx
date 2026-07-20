import { Plus } from 'lucide-react'
import { useExercises } from '../exercise/use-exercises'
import { useWorkouts } from './use-workouts'
import { WorkoutList } from './WorkoutList'
import { getUpcomingWorkouts } from './workout-helpers'
import { useNavigate } from '@/lib/router-compat'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/PageHeader'

export function WorkoutsPage() {
  const navigate = useNavigate()
  const { exercises } = useExercises()
  const {
    workouts,
    deleteWorkout,
    duplicateWorkout,
    finishWorkout,
    reopenWorkout,
  } = useWorkouts()

  const upcomingWorkouts = getUpcomingWorkouts(workouts)

  const handleStart = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/session`)
  }

  const handleEdit = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/edit`)
  }

  const handleDuplicate = (workoutId: string) => {
    duplicateWorkout(workoutId, {
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleDelete = (workoutId: string) => {
    deleteWorkout(workoutId)
  }

  const handleToggleComplete = (workoutId: string) => {
    const workout = workouts.find((entry) => entry.id === workoutId)
    if (workout?.status === 'completed') {
      void reopenWorkout(workoutId)
    } else {
      void finishWorkout(workoutId)
    }
  }

  return (
    <div>
      <PageHeader
        title="Workouts"
        action={
          <Button onClick={() => navigate('/workouts/new')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button variant="default">Upcoming</Button>
          <Button
            variant="outline"
            onClick={() => navigate('/workouts/completed')}
          >
            Completed
          </Button>
        </div>

        {upcomingWorkouts.length > 0 ? (
          <WorkoutList
            workouts={upcomingWorkouts}
            exercises={exercises}
            onStart={handleStart}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <Card className="p-12 text-center">
            <p className="text-slate-500 mb-4">No upcoming workouts.</p>
            <p className="text-sm text-slate-500 mb-4">
              Create your first workout to get started!
            </p>
            <Button onClick={() => navigate('/workouts/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workout
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
