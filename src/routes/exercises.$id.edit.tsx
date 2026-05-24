import { createFileRoute } from '@tanstack/react-router'
import { ExerciseFormPage } from '@/features/exercise/ExerciseFormPage'

export const Route = createFileRoute('/exercises/$id/edit')({
  component: ExerciseFormPage,
})
