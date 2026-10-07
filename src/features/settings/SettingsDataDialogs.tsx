import { m } from '#/paraglide/messages'
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
            <AlertDialogTitle>{m.young_violet_walrus()}</AlertDialogTitle>
            <AlertDialogDescription>
              {m.gentle_azure_dove()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{m.plain_lilac_puma()}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {m.sunny_cyan_bear()}
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
              {importError ? m.swift_ivory_lion() : m.sleepy_ruby_gecko()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {importError ? (
                <span className="text-destructive-muted-foreground">
                  {importError}
                </span>
              ) : (
                m.sleepy_peach_mole()
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCloseImportDialog}>
              {m.upbeat_peach_lion()}
            </AlertDialogCancel>
            {!importError && (
              <AlertDialogAction onClick={onConfirmImport}>
                {m.happy_cyan_heron()}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
