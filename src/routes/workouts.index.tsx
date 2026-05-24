import { createFileRoute } from '@tanstack/react-router'
import { WorkoutsPage } from '@/features/workout/WorkoutsPage'

export const Route = createFileRoute('/workouts/')({
  component: WorkoutsPage,
})
