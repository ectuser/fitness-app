import { Calendar, Play, Plus } from 'lucide-react'
import { m } from '#/paraglide/messages'
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
      <h2 className="text-lg font-semibold mb-4">{m.lucky_olive_crane()}</h2>
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
              {m.shy_pewter_gull({
                exerciseCount: nextWorkout.exercises.length,
                setCount: getWorkoutTotalSets(nextWorkout),
              })}
            </p>
          </div>
          <Button
            onClick={() => onStartWorkout(nextWorkout.id)}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {m.gentle_plum_wolf()}
          </Button>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">{m.misty_ivory_finch()}</p>
          <p className="text-sm text-muted-foreground mb-4">
            {m.bold_azure_mole()}
          </p>
          <Button onClick={onCreateWorkout}>
            <Plus className="w-4 h-4 mr-2" />
            {m.warm_sage_otter()}
          </Button>
        </Card>
      )}
    </section>
  )
}
