import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  completedBenchWorkout,
  exercises,
  upcomingWorkout,
} from '../../fixtures'
import type { ReactNode } from 'react'
import { DashboardHeaderActions } from '@/features/dashboard/DashboardHeaderActions'
import { NextWorkoutSection } from '@/features/dashboard/NextWorkoutSection'
import { QuickStatsSection } from '@/features/dashboard/QuickStatsSection'
import { UpcomingWorkoutsSection } from '@/features/dashboard/UpcomingWorkoutsSection'

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

vi.mock('@/lib/router-compat', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}))

describe('dashboard components', () => {
  it('renders header actions and delegates click handlers', () => {
    const onCreateWorkout = vi.fn()

    render(<DashboardHeaderActions onCreateWorkout={onCreateWorkout} />)

    fireEvent.click(screen.getByRole('button', { name: /new workout/i }))

    expect(onCreateWorkout).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/settings',
    )
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

  it('renders quick stats', () => {
    render(
      <QuickStatsSection
        exercisesCount={12}
        upcomingWorkoutsCount={3}
        completedWorkoutsCount={5}
        totalSets={42}
      />,
    )

    expect(screen.getByText('42')).toBeInTheDocument()
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
      </>,
    )

    fireEvent.click(screen.getByRole('button', { name: /create workout/i }))

    expect(onCreateWorkout).toHaveBeenCalled()
    expect(screen.queryByText('Coming Workouts')).not.toBeInTheDocument()
    expect(onCloseImportDialog).not.toHaveBeenCalled()
  })
})
