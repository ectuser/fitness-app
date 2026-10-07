import { Edit, Trash2 } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { useWorkouts } from '../workout/use-workouts'
import {
  useExerciseHistory,
  useExerciseStats,
} from '../training-history/use-training-history'
import { useExercises } from './use-exercises'
import { useNavigate, useParams } from '@/lib/router-compat'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exercises, deleteExercise } = useExercises()
  const { workouts } = useWorkouts()

  const exercise = exercises.find((e) => e.id === id)
  const stats = useExerciseStats(id || '', workouts)
  const history = useExerciseHistory(id || '', workouts)

  if (!exercise) {
    return (
      <div>
        <PageHeader title={m.plain_rose_otter()} showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="mb-4 text-muted-foreground">{m.shiny_mint_walrus()}</p>
          <Button onClick={() => navigate('/exercises')}>
            {m.nimble_olive_walrus()}
          </Button>
        </div>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteExercise(exercise.id)
      navigate('/exercises')
    } catch (error) {
      alert(error instanceof Error ? error.message : m.giant_olive_dingo())
    }
  }

  return (
    <div>
      <PageHeader
        title={exercise.name}
        showBack
        action={
          exercise.isCustom && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/exercises/${exercise.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {m.quick_yellow_snail()}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {m.noble_azure_fox({ name: exercise.name })}
                      {history.length > 0 && (
                        <p className="mt-2 font-medium text-destructive">
                          {m.loyal_ivory_goose({ count: history.length })}
                        </p>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {m.bold_ivory_parrot()}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      {m.brave_cyan_dingo()}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Exercise Info */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">{exercise.name}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {m.zesty_green_elk()}
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {exercise.comments && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  {m.silent_orange_newt()}
                </h3>
                <p className="text-foreground">{exercise.comments}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {m.sunny_peach_zebra()}
          </h2>
          {stats ? (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-2xl font-bold">
                  {stats.maxWeight} {stats.maxWeightUnit}
                </div>
                <div className="text-sm text-muted-foreground">
                  {m.humble_khaki_walrus()}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {m.crisp_peach_hare({ reps: stats.maxWeightReps })}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold">{stats.totalSets}</div>
                <div className="text-sm text-muted-foreground">
                  {m.sunny_teal_pony()}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              {m.eager_plum_hawk()}
            </Card>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{m.merry_pink_viper()}</h2>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((workout) => (
                <Card key={workout.workoutId} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{workout.workoutName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {workout.date}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {m.jolly_crimson_dingo({ count: workout.setData.length })}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {workout.setData.map((set, idx) => (
                      <div
                        key={set.id}
                        className="flex justify-between text-sm text-foreground"
                      >
                        <span>{m.jolly_ivory_dingo({ number: idx + 1 })}</span>
                        <span>
                          {m.jumpy_slate_whale({
                            weight: set.weight,
                            unit: set.weightUnit,
                            reps: set.reps,
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              {m.merry_khaki_quail()}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
