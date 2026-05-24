import { createFileRoute } from '@tanstack/react-router'
import { ExerciseDetailPage } from '@/features/exercise/ExerciseDetailPage'

export const Route = createFileRoute('/exercises/$id/')({
  component: ExerciseDetailPage,
})
