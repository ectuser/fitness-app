import { useExercises } from '../exercise/use-exercises'
import { usePwaUpdateStatus } from '../app-update/pwa-update-status'
import { useWorkouts } from '../workout/use-workouts'
import { useDashboardDataManagement } from '../dashboard/use-dashboard-data-management'
import { DashboardDialogs } from '../dashboard/DashboardDialogs'
import { AppUpdateSettingsSection } from './AppUpdateSettingsSection'
import { AppearanceSettingsSection } from './AppearanceSettingsSection'
import { DataSettingsSection } from './DataSettingsSection'
import { SettingsSectionNav } from './SettingsSectionNav'
import { PageHeader } from '@/components/layout/PageHeader'
import { useSettings } from '@/features/settings/use-settings'

export function SettingsPage() {
  const updateStatus = usePwaUpdateStatus()
  const { exercises } = useExercises()
  const { workouts } = useWorkouts()
  const { settings, updateSettings } = useSettings()
  const {
    closeImportDialog,
    fileInputRef,
    handleConfirmImport,
    handleExportData,
    handleFileChange,
    handleImportClick,
    handleResetData,
    importError,
    setShowResetDialog,
    showImportDialog,
    showResetDialog,
  } = useDashboardDataManagement({
    exercises,
    workouts,
    settings,
  })

  return (
    <div>
      <PageHeader title="Settings" showBack />

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[1fr_14rem]">
        <div className="space-y-6">
          <AppearanceSettingsSection
            themeMode={settings.themeMode}
            onThemeModeChange={(themeMode) => updateSettings({ themeMode })}
          />
          <DataSettingsSection
            fileInputRef={fileInputRef}
            onExportData={handleExportData}
            onFileChange={handleFileChange}
            onImportClick={handleImportClick}
            onOpenResetDialog={() => setShowResetDialog(true)}
          />
          <AppUpdateSettingsSection
            hasAvailableUpdate={updateStatus.state === 'available-update'}
          />
        </div>

        <SettingsSectionNav />
      </div>

      <DashboardDialogs
        importError={importError}
        onCloseImportDialog={closeImportDialog}
        onConfirmImport={handleConfirmImport}
        onConfirmReset={handleResetData}
        openImportDialog={showImportDialog}
        openResetDialog={showResetDialog}
        setOpenResetDialog={setShowResetDialog}
      />
    </div>
  )
}
