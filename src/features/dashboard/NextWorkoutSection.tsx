import { Calendar, Play, Plus } from 'lucide-react'
import {
  formatWorkoutDate,
  getWorkoutMuscleGroups,
  getWorkoutTotalSets,
} from '../workout/workout-helpers'
import type { Exercise, Workout } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface NextWorkoutSectionProps {
  exercises: Array<Exercise>
  nextWorkout: Workout | null
  onCreateWorkout: () => void
  onStartWorkout: (workoutId: string) => void
}

export function NextWorkoutSection({
  exercises,
  nextWorkout,
  onCreateWorkout,
  onStartWorkout,
}: NextWorkoutSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Next Workout</h2>
      {nextWorkout ? (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{nextWorkout.name}</h3>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Calendar className="w-4 h-4" />
              <span>{formatWorkoutDate(nextWorkout.date)}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {getWorkoutMuscleGroups(nextWorkout, exercises).map((muscle) => (
                <Badge key={muscle} variant="outline" className="text-xs">
                  {muscle}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {nextWorkout.exercises.length} exercise
              {nextWorkout.exercises.length !== 1 ? 's' : ''} •{' '}
              {getWorkoutTotalSets(nextWorkout)} set
              {getWorkoutTotalSets(nextWorkout) !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={() => onStartWorkout(nextWorkout.id)}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No upcoming workouts.</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create one to get started!
          </p>
          <Button onClick={onCreateWorkout}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workout
          </Button>
        </Card>
      )}
    </section>
  )
}
