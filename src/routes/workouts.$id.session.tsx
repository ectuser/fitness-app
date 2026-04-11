import { createFileRoute } from '@tanstack/react-router'
import { WorkoutSessionPage } from '@/pages/WorkoutSessionPage'

export const Route = createFileRoute('/workouts/$id/session')({
  component: WorkoutSessionPage,
})
