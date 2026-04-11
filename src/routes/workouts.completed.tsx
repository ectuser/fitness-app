import { createFileRoute } from '@tanstack/react-router'
import { WorkoutsCompletedPage } from '@/pages/WorkoutsCompletedPage'

export const Route = createFileRoute('/workouts/completed')({
  component: WorkoutsCompletedPage,
})
