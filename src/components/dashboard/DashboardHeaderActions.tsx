import { Download, Plus, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderActionsProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onCreateWorkout: () => void;
  onExportData: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImportClick: () => void;
  onOpenResetDialog: () => void;
}

export function DashboardHeaderActions({
  fileInputRef,
  onCreateWorkout,
  onExportData,
  onFileChange,
  onImportClick,
  onOpenResetDialog,
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
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
  );
}
