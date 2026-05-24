import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { exerciseQueryKeys } from '../exercise/exercise-queries'
import { settingsQueryKeys } from '../settings/settings-queries'
import { workoutQueryKeys } from '../workout/workout-queries'
import {
  buildExportPayload,
  importDashboardData,
  parseImportPayload,
  resetDashboardData,
} from './dashboard-data'
import type { ImportPayload } from './dashboard-data'
import type { Exercise, Settings, Workout } from '@/types'

interface UseDashboardDataManagementOptions {
  exercises: Exercise[]
  settings: Settings
  workouts: Workout[]
}

export function useDashboardDataManagement({
  exercises,
  settings,
  workouts,
}: UseDashboardDataManagementOptions) {
  const queryClient = useQueryClient()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImportRef = useRef<ImportPayload | null>(null)

  return {
    fileInputRef,
    importError,
    showImportDialog,
    showResetDialog,
    handleResetData: () => {
      const resetState = resetDashboardData()

      queryClient.setQueryData(exerciseQueryKeys.list(), resetState.exercises)
      queryClient.setQueryData(workoutQueryKeys.list(), resetState.workouts)
      queryClient.setQueryData(settingsQueryKeys.detail(), resetState.settings)
      setShowResetDialog(false)
    },
    handleExportData: () => {
      const exportData = buildExportPayload({ exercises, workouts, settings })
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')

      link.href = url
      link.download = `fitness-app-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    handleImportClick: () => {
      fileInputRef.current?.click()
    },
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        try {
          const content = loadEvent.target?.result as string
          pendingImportRef.current = parseImportPayload(content)
          setImportError(null)
        } catch (error) {
          pendingImportRef.current = null
          setImportError(
            error instanceof Error
              ? error.message
              : 'Failed to import data. Please try again.',
          )
        }

        setShowImportDialog(true)
      }

      reader.readAsText(file)
      event.target.value = ''
    },
    handleConfirmImport: () => {
      const importData = pendingImportRef.current

      if (!importData) {
        return
      }

      try {
        importDashboardData(importData)
        pendingImportRef.current = null
        window.location.reload()
      } catch {
        setImportError('Failed to import data. Please try again.')
      }
    },
    closeImportDialog: () => {
      setShowImportDialog(false)
      setImportError(null)
      pendingImportRef.current = null
    },
    setShowResetDialog,
  }
}
