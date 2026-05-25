import { createFileRoute } from '@tanstack/react-router'
import { AppUpdatePage } from '@/features/app-update/AppUpdatePage'

export const Route = createFileRoute('/app-update')({
  component: AppUpdatePage,
})
