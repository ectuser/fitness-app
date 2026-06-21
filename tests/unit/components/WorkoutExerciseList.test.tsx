import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createWorkoutExercise, exercises } from '../fixtures'
import { WorkoutExerciseList } from '@/features/workout/WorkoutExerciseList'

vi.mock('@/features/workout/WorkoutExerciseCard', () => ({
  WorkoutExerciseCard: ({
    exercise,
    onChange,
    onMoveDown,
    onMoveUp,
    onRemove,
    onReplace,
    workoutExercise,
  }: {
    exercise: { name: string }
    onChange: (exercise: ReturnType<typeof createWorkoutExercise>) => void
    onMoveDown: () => void
    onMoveUp: () => void
    onRemove: () => void
    onReplace: () => void
    workoutExercise: ReturnType<typeof createWorkoutExercise>
  }) => (
    <div>
      <span>{exercise.name}</span>
      <button
        type="button"
        onClick={() => onChange({ ...workoutExercise, comment: 'Updated' })}
      >
        Change
      </button>
      <button type="button" onClick={onMoveUp}>
        Up
      </button>
      <button type="button" onClick={onMoveDown}>
        Down
      </button>
      <button type="button" onClick={onRemove}>
        Remove
      </button>
      <button type="button" onClick={onReplace}>
        Replace
      </button>
    </div>
  ),
}))

describe('WorkoutExerciseList', () => {
  it('renders the empty state when there are no exercises', () => {
    render(
      <WorkoutExerciseList
        workoutExercises={[]}
        exercises={exercises}
        onChangeExercise={vi.fn()}
        onMoveExerciseDown={vi.fn()}
        onMoveExerciseUp={vi.fn()}
        onRemoveExercise={vi.fn()}
        onReplaceExercise={vi.fn()}
        emptyState={<div>No items</div>}
      />,
    )

    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders workout exercise cards for matching exercises', () => {
    const onChangeExercise = vi.fn()
    const onMoveExerciseDown = vi.fn()
    const onMoveExerciseUp = vi.fn()
    const onRemoveExercise = vi.fn()
    const onReplaceExercise = vi.fn()

    render(
      <WorkoutExerciseList
        workoutExercises={[createWorkoutExercise('exercise-bench')]}
        exercises={exercises}
        onChangeExercise={onChangeExercise}
        onMoveExerciseDown={onMoveExerciseDown}
        onMoveExerciseUp={onMoveExerciseUp}
        onRemoveExercise={onRemoveExercise}
        onReplaceExercise={onReplaceExercise}
        emptyState={<div>No items</div>}
      />,
    )

    expect(screen.getByText('Bench Press')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    fireEvent.click(screen.getByRole('button', { name: 'Up' }))
    fireEvent.click(screen.getByRole('button', { name: 'Down' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    fireEvent.click(screen.getByRole('button', { name: 'Replace' }))

    expect(onChangeExercise).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ comment: 'Updated' }),
    )
    expect(onMoveExerciseUp).toHaveBeenCalledWith(0)
    expect(onMoveExerciseDown).toHaveBeenCalledWith(0)
    expect(onRemoveExercise).toHaveBeenCalledWith(0)
    expect(onReplaceExercise).toHaveBeenCalledWith(0)
  })

  it('skips workout entries without a matching exercise definition', () => {
    const { container } = render(
      <WorkoutExerciseList
        workoutExercises={[createWorkoutExercise('missing-exercise')]}
        exercises={exercises}
        onChangeExercise={vi.fn()}
        onMoveExerciseDown={vi.fn()}
        onMoveExerciseUp={vi.fn()}
        onRemoveExercise={vi.fn()}
        onReplaceExercise={vi.fn()}
        emptyState={<div>No items</div>}
      />,
    )

    expect(container.textContent).toBe('')
  })
})
