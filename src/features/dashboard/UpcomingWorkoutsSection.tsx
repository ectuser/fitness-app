import { Calendar, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  formatWorkoutDate,
  getWorkoutMuscleGroups,
} from '@/features/workout/workout-helpers'
import type { Exercise, Workout } from '@/types'

interface UpcomingWorkoutsSectionProps {
  exercises: Exercise[]
  onShowAll: () => void
  onStartWorkout: (workoutId: string) => void
  workouts: Workout[]
}

export function UpcomingWorkoutsSection({
  exercises,
  onShowAll,
  onStartWorkout,
  workouts,
}: UpcomingWorkoutsSectionProps) {
  if (workouts.length <= 1) {
    return null
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Coming Workouts</h2>
        {workouts.length > 4 && (
          <Button variant="ghost" size="sm" onClick={onShowAll}>
            Show All
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {workouts.slice(1, 5).map((workout) => {
          const muscles = getWorkoutMuscleGroups(workout, exercises)
          return (
            <Card
              key={workout.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onStartWorkout(workout.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{workout.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{formatWorkoutDate(workout.date)}</span>
                  </div>
                  {muscles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {muscles.slice(0, 3).map((muscle) => (
                        <Badge
                          key={muscle}
                          variant="outline"
                          className="text-xs"
                        >
                          {muscle}
                        </Badge>
                      ))}
                      {muscles.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{muscles.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    {workout.exercises.length} exercise
                    {workout.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    onStartWorkout(workout.id)
                  }}
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
