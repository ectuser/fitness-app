import { createFileRoute } from '@tanstack/react-router'
import { WorkoutEditPage } from '@/features/workout/WorkoutEditPage'

export const Route = createFileRoute('/workouts/new')({
  component: WorkoutEditPage,
})
