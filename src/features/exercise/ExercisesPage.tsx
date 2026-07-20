import { Plus } from 'lucide-react'
import { useExercises } from './use-exercises'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@/lib/router-compat'
import { Badge } from '@/components/ui/badge'

export function ExercisesPage() {
  const navigate = useNavigate()
  const { exercises } = useExercises()

  return (
    <div>
      <PageHeader
        title="Exercises"
        action={
          <Button onClick={() => navigate('/exercises/new')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              className="w-full cursor-pointer rounded-lg border bg-card p-4 text-left text-card-foreground shadow-sm hover:border-ring"
              onClick={() => navigate(`/exercises/${exercise.id}`)}
            >
              <span className="block font-semibold mb-2">{exercise.name}</span>
              <span className="flex flex-wrap gap-1">
                {exercise.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
