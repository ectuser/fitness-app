import { createFileRoute } from '@tanstack/react-router'
import { WorkoutsCompletedPage } from '@/features/workout/WorkoutsCompletedPage'

export const Route = createFileRoute('/workouts/completed')({
  component: WorkoutsCompletedPage,
})
