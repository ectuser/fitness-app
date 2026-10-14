import { createFileRoute } from '@tanstack/react-router'
import { WorkoutSessionPage } from '@/features/workout/WorkoutSessionPage'

export const Route = createFileRoute('/workouts/$id/session')({
  component: WorkoutSessionPage,
})
