import { Download, RotateCcw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface DataSettingsSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onExportData: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImportClick: () => void
  onOpenResetDialog: () => void
}

export function DataSettingsSection({
  fileInputRef,
  onExportData,
  onFileChange,
  onImportClick,
  onOpenResetDialog,
}: DataSettingsSectionProps) {
  return (
    <section id="data">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Data</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={onExportData}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={onImportClick}>
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
          <Button
            variant="destructive"
            onClick={onOpenResetDialog}
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
          onChange={onFileChange}
          className="hidden"
        />
      </Card>
    </section>
  )
}
