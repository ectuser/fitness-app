import { Download, Plus, RefreshCw, Settings, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardHeaderActionsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  hasAvailableUpdate?: boolean
  onCreateWorkout: () => void
  onExportData: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImportClick: () => void
  onOpenAppUpdate: () => void
  onOpenResetDialog: () => void
}

export function DashboardHeaderActions({
  fileInputRef,
  hasAvailableUpdate = false,
  onCreateWorkout,
  onExportData,
  onFileChange,
  onImportClick,
  onOpenAppUpdate,
  onOpenResetDialog,
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Settings className="w-4 h-4" />
            {hasAvailableUpdate && (
              <span
                aria-hidden
                className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500"
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onOpenAppUpdate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="flex flex-1 items-center justify-between gap-3">
              App Update
              {hasAvailableUpdate && (
                <span className="text-xs font-medium text-sky-700">
                  Available
                </span>
              )}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onImportClick}>
            <Upload className="w-4 h-4 mr-2" />
            Import Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onOpenResetDialog}
            className="text-red-600 focus:text-red-600"
          >
            Reset Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onFileChange}
        className="hidden"
      />
      <Button onClick={onCreateWorkout} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        New Workout
      </Button>
    </div>
  )
}
