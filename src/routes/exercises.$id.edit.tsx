import { createFileRoute } from '@tanstack/react-router'
import { ExerciseFormPage } from '@/pages/ExerciseFormPage'

export const Route = createFileRoute('/exercises/$id/edit')({
  component: ExerciseFormPage,
})
