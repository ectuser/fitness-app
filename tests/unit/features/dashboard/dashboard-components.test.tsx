import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DashboardDialogs } from '@/features/dashboard/DashboardDialogs'
import { DashboardHeaderActions } from '@/features/dashboard/DashboardHeaderActions'
import { NextWorkoutSection } from '@/features/dashboard/NextWorkoutSection'
import { QuickStatsSection } from '@/features/dashboard/QuickStatsSection'
import { UpcomingWorkoutsSection } from '@/features/dashboard/UpcomingWorkoutsSection'
import {
  completedBenchWorkout,
  exercises,
  upcomingWorkout,
} from '../../fixtures'

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({
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
  DropdownMenuSeparator: () => <div />,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}))

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

describe('dashboard components', () => {
  it('renders header actions and delegates click handlers', () => {
    const onCreateWorkout = vi.fn()
    const onExportData = vi.fn()
    const onFileChange = vi.fn()
    const onImportClick = vi.fn()
    const onOpenAppUpdate = vi.fn()
    const onOpenResetDialog = vi.fn()

    render(
      <DashboardHeaderActions
        fileInputRef={{ current: null }}
        onCreateWorkout={onCreateWorkout}
        onExportData={onExportData}
        onFileChange={onFileChange}
        onImportClick={onImportClick}
        onOpenAppUpdate={onOpenAppUpdate}
        onOpenResetDialog={onOpenResetDialog}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /new workout/i }))
    fireEvent.click(screen.getByRole('button', { name: /app update/i }))
    fireEvent.click(screen.getByRole('button', { name: /export/i }))
    fireEvent.click(screen.getByRole('button', { name: /import/i }))
    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(onCreateWorkout).toHaveBeenCalled()
    expect(onOpenAppUpdate).toHaveBeenCalled()
    expect(onExportData).toHaveBeenCalled()
    expect(onImportClick).toHaveBeenCalled()
    expect(onOpenResetDialog).toHaveBeenCalled()
    expect(onFileChange).not.toHaveBeenCalled()
  })

  it('renders next workout and upcoming workouts sections', () => {
    const onCreateWorkout = vi.fn()
    const onShowAll = vi.fn()
    const onStartWorkout = vi.fn()

    render(
      <>
        <NextWorkoutSection
          exercises={exercises}
          nextWorkout={completedBenchWorkout}
          onCreateWorkout={onCreateWorkout}
          onStartWorkout={onStartWorkout}
        />
        <UpcomingWorkoutsSection
          exercises={exercises}
          workouts={[
            completedBenchWorkout,
            upcomingWorkout,
            { ...upcomingWorkout, id: 'workout-3', name: 'Core Day' },
            { ...upcomingWorkout, id: 'workout-4', name: 'Upper Day' },
            { ...upcomingWorkout, id: 'workout-5', name: 'Lower Day' },
          ]}
          onShowAll={onShowAll}
          onStartWorkout={onStartWorkout}
        />
      </>,
    )

    expect(screen.getByText('Next Workout')).toBeInTheDocument()
    expect(screen.getByText('Coming Workouts')).toBeInTheDocument()
    fireEvent.click(
      screen.getAllByRole('button', { name: /start workout/i })[0],
    )
    fireEvent.click(screen.getByRole('button', { name: /show all/i }))
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0])

    expect(onStartWorkout).toHaveBeenCalled()
    expect(onShowAll).toHaveBeenCalled()
    expect(onCreateWorkout).not.toHaveBeenCalled()
  })

  it('renders quick stats and dialog states', () => {
    const onCloseImportDialog = vi.fn()
    const onConfirmImport = vi.fn()
    const onConfirmReset = vi.fn()
    const setOpenResetDialog = vi.fn()

    render(
      <>
        <QuickStatsSection
          exercisesCount={12}
          upcomingWorkoutsCount={3}
          completedWorkoutsCount={5}
          totalSets={42}
        />
        <DashboardDialogs
          importError={null}
          onCloseImportDialog={onCloseImportDialog}
          onConfirmImport={onConfirmImport}
          onConfirmReset={onConfirmReset}
          openImportDialog
          openResetDialog
          setOpenResetDialog={setOpenResetDialog}
        />
      </>,
    )

    expect(screen.getByText('42')).toBeInTheDocument()
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

  it('renders empty states and error dialog branches', () => {
    const onCreateWorkout = vi.fn()
    const onCloseImportDialog = vi.fn()

    render(
      <>
        <NextWorkoutSection
          exercises={exercises}
          nextWorkout={null}
          onCreateWorkout={onCreateWorkout}
          onStartWorkout={vi.fn()}
        />
        <UpcomingWorkoutsSection
          exercises={exercises}
          workouts={[completedBenchWorkout]}
          onShowAll={vi.fn()}
          onStartWorkout={vi.fn()}
        />
        <DashboardDialogs
          importError="Bad backup"
          onCloseImportDialog={onCloseImportDialog}
          onConfirmImport={vi.fn()}
          onConfirmReset={vi.fn()}
          openImportDialog
          openResetDialog={false}
          setOpenResetDialog={vi.fn()}
        />
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: /create workout/i }))

    expect(onCreateWorkout).toHaveBeenCalled()
    expect(screen.queryByText('Coming Workouts')).not.toBeInTheDocument()
    expect(screen.getByText('Import Failed')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /import data/i }),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i }).at(-1)!)
    expect(onCloseImportDialog).toHaveBeenCalled()
  })
})
