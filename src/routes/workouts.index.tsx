import { createFileRoute } from '@tanstack/react-router'
import { WorkoutsPage } from '@/pages/WorkoutsPage'

export const Route = createFileRoute('/workouts/')({
  component: WorkoutsPage,
})
