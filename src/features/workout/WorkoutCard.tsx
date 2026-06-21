import { Calendar, Play } from 'lucide-react'
import {
  formatWorkoutDate,
  getWorkoutMuscleGroups,
  getWorkoutTotalSets,
} from './workout-helpers'
import { WorkoutMenu } from './WorkoutMenu'
import type { Exercise, Workout } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface WorkoutCardProps {
  workout: Workout
  exercises: Array<Exercise>
  onStart: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleComplete: () => void
}

export function WorkoutCard({
  workout,
  exercises,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleComplete,
}: WorkoutCardProps) {
  const muscleGroups = getWorkoutMuscleGroups(workout, exercises)
  const totalSets = getWorkoutTotalSets(workout)

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{workout.name}</h3>
            {workout.isCompleted && (
              <Badge variant="secondary" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatWorkoutDate(workout.date, { includeYesterday: true })}
            </span>
          </div>
        </div>

        <WorkoutMenu
          workout={workout}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {muscleGroups.map((muscle) => (
            <Badge key={muscle} variant="outline" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>

        <div className="text-sm text-slate-600">
          {workout.exercises.length} exercise
          {workout.exercises.length !== 1 ? 's' : ''} • {totalSets} set
          {totalSets !== 1 ? 's' : ''}
        </div>

        {!workout.isCompleted && (
          <Button onClick={onStart} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </Button>
        )}
      </div>
    </Card>
  )
}
