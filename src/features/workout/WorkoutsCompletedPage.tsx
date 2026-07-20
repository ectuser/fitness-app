import { useExercises } from '../exercise/use-exercises'
import { useWorkouts } from './use-workouts'
import { WorkoutList } from './WorkoutList'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from '@/lib/router-compat'

export function WorkoutsCompletedPage() {
  const navigate = useNavigate()
  const { exercises } = useExercises()
  const { workouts, deleteWorkout, duplicateWorkout, reopenWorkout } =
    useWorkouts()

  const completedWorkouts = workouts
    .filter((w) => w.status === 'completed')
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || a.date)
      const dateB = new Date(b.completedAt || b.date)
      return dateB.getTime() - dateA.getTime()
    })

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
    void reopenWorkout(workoutId)
  }

  return (
    <div>
      <PageHeader title="Completed Workouts" showBack />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button variant="outline" onClick={() => navigate('/workouts')}>
            Upcoming
          </Button>
          <Button variant="default">Completed</Button>
        </div>

        {completedWorkouts.length > 0 ? (
          <WorkoutList
            workouts={completedWorkouts}
            exercises={exercises}
            onStart={handleStart}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <Card className="p-12 text-center">
            <p className="mb-2 text-muted-foreground">
              No completed workouts yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Complete a workout to see it here!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
