import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SettingsDataDialogsProps {
  importError: string | null
  onCloseImportDialog: () => void
  onConfirmImport: () => void
  onConfirmReset: () => void
  openImportDialog: boolean
  openResetDialog: boolean
  setOpenResetDialog: (open: boolean) => void
}

export function SettingsDataDialogs({
  importError,
  onCloseImportDialog,
  onConfirmImport,
  onConfirmReset,
  openImportDialog,
  openResetDialog,
  setOpenResetDialog,
}: SettingsDataDialogsProps) {
  return (
    <>
      <AlertDialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your workouts, custom exercises,
              and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={openImportDialog}
        onOpenChange={(open) => !open && onCloseImportDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {importError ? 'Import Failed' : 'Import Data?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {importError ? (
                <span className="text-destructive-muted-foreground">
                  {importError}
                </span>
              ) : (
                'This will replace all your current data with the imported data. Your existing workouts, exercises, and settings will be overwritten.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseImportDialog}>
              Cancel
            </AlertDialogCancel>
            {!importError && (
              <AlertDialogAction onClick={onConfirmImport}>
                Import Data
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
