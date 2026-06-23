import { Download, RefreshCw, RotateCcw, Upload } from 'lucide-react'
import { useExercises } from '../exercise/use-exercises'
import { usePwaUpdateStatus } from '../app-update/pwa-update-status'
import { useWorkouts } from '../workout/use-workouts'
import { useDashboardDataManagement } from '../dashboard/use-dashboard-data-management'
import { DashboardDialogs } from '../dashboard/DashboardDialogs'
import type { ThemeMode } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettings } from '@/features/settings/use-settings'
import { Link } from '@/lib/router-compat'

const settingsSections = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'data', label: 'Data' },
  { id: 'app-update', label: 'App Update' },
]

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
          <section id="appearance">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
              <div className="grid gap-2">
                <Label htmlFor="theme-mode">Theme</Label>
                <Select
                  value={settings.themeMode}
                  onValueChange={(value) =>
                    updateSettings({ themeMode: value as ThemeMode })
                  }
                >
                  <SelectTrigger id="theme-mode" aria-label="Theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </section>

          <section id="data">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Data</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleImportClick}>
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowResetDialog(true)}
                  className="sm:col-span-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Data
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </Card>
          </section>

          <section id="app-update">
            <Card className="p-6">
              <h2 className="mb-2 text-lg font-semibold">App Update</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {updateStatus.state === 'available-update'
                  ? 'An update is available.'
                  : 'Check update status and service worker details.'}
              </p>
              <Button asChild variant="outline">
                <Link to="/app-update">
                  <RefreshCw className="w-4 h-4" />
                  Open App Update
                </Link>
              </Button>
            </Card>
          </section>
        </div>

        <nav className="hidden lg:block">
          <div className="sticky top-6 space-y-1">
            {settingsSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {section.label}
              </a>
            ))}
          </div>
        </nav>
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
