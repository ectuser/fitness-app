import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { SettingsDataDialogs } from '@/features/settings/SettingsDataDialogs'

vi.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({
    children,
    onClick,
  }: {
    children: ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: ReactNode }) => (
    <h2>{children}</h2>
  ),
}))

describe('settings components', () => {
  it('renders data dialog states and delegates actions', () => {
    const onCloseImportDialog = vi.fn()
    const onConfirmImport = vi.fn()
    const onConfirmReset = vi.fn()
    const setOpenResetDialog = vi.fn()

    render(
      <SettingsDataDialogs
        importError={null}
        onCloseImportDialog={onCloseImportDialog}
        onConfirmImport={onConfirmImport}
        onConfirmReset={onConfirmReset}
        openImportDialog
        openResetDialog
        setOpenResetDialog={setOpenResetDialog}
      />,
    )

    expect(screen.getByText('Reset All Data?')).toBeInTheDocument()
    expect(screen.getByText('Import Data?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset data/i }))
    fireEvent.click(screen.getByRole('button', { name: /import data/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i }).at(-1)!)

    expect(onConfirmReset).toHaveBeenCalled()
    expect(onConfirmImport).toHaveBeenCalled()
    expect(setOpenResetDialog).not.toHaveBeenCalled()
    expect(onCloseImportDialog).toHaveBeenCalled()
  })

  it('renders import errors without a confirm action', () => {
    const onCloseImportDialog = vi.fn()

    render(
      <SettingsDataDialogs
        importError="Bad backup"
        onCloseImportDialog={onCloseImportDialog}
        onConfirmImport={vi.fn()}
        onConfirmReset={vi.fn()}
        openImportDialog
        openResetDialog={false}
        setOpenResetDialog={vi.fn()}
      />,
    )

    expect(screen.getByText('Import Failed')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /import data/i }),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i }).at(-1)!)

    expect(onCloseImportDialog).toHaveBeenCalled()
  })
})
