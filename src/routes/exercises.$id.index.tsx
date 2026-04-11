import { createFileRoute } from '@tanstack/react-router'
import { ExerciseDetailPage } from '@/pages/ExerciseDetailPage'

export const Route = createFileRoute('/exercises/$id/')({
  component: ExerciseDetailPage,
})
