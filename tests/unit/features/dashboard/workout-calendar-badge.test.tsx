import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createWorkout } from '../../fixtures'
import { WorkoutCalendarSection } from '@/features/dashboard/WorkoutCalendarSection'

const today = new Date(2026, 9, 7, 12)

function completedAt(id: string, day: number, hour: number) {
  return createWorkout({
    id,
    status: 'completed',
    completedAt: new Date(2026, 9, day, hour).toISOString(),
  })
}

describe('WorkoutCalendarSection count badge', () => {
  const workouts = [
    completedAt('a', 5, 10),
    completedAt('b', 5, 18),
    completedAt('c', 5, 20),
    completedAt('d', 6, 10),
  ]

  it('shows the count on a day with several workouts', () => {
    render(<WorkoutCalendarSection today={today} workouts={workouts} />)

    const cell = screen.getByRole('img', { name: 'Mon 5 Oct: 3 workouts' })
    expect(within(cell).getByTestId('workout-count-badge').textContent).toBe(
      '3',
    )
  })

  it('shows no badge for one workout or a rest day', () => {
    render(<WorkoutCalendarSection today={today} workouts={workouts} />)

    const single = screen.getByRole('img', { name: 'Tue 6 Oct: 1 workout' })
    const rest = screen.getByRole('img', { name: 'Sun 4 Oct: rest day' })
    expect(within(single).queryByTestId('workout-count-badge')).toBeNull()
    expect(within(rest).queryByTestId('workout-count-badge')).toBeNull()
  })
})
