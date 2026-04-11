import { createFileRoute } from '@tanstack/react-router'
import { WorkoutEditPage } from '@/pages/WorkoutEditPage'

export const Route = createFileRoute('/workouts/$id/edit')({
  component: WorkoutEditPage,
})
