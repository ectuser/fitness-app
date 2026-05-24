import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkoutCard } from '@/features/workout/WorkoutCard';
import { completedBenchWorkout, exercises, upcomingWorkout } from '../fixtures';

vi.mock('@/features/workout/WorkoutMenu', () => ({
  WorkoutMenu: ({
    onDelete,
    onDuplicate,
    onEdit,
    onToggleComplete,
  }: {
    onDelete: () => void;
    onDuplicate: () => void;
    onEdit: () => void;
    onToggleComplete: () => void;
  }) => (
    <div>
      <button type="button" onClick={onEdit}>
        Edit Workout
      </button>
      <button type="button" onClick={onDuplicate}>
        Duplicate Workout
      </button>
      <button type="button" onClick={onDelete}>
        Delete Workout
      </button>
      <button type="button" onClick={onToggleComplete}>
        Toggle Workout
      </button>
    </div>
  ),
}));

describe('WorkoutCard', () => {
  it('renders workout details with derived metadata', () => {
    render(
      <WorkoutCard
        workout={completedBenchWorkout}
        exercises={exercises}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === '1 exercise • 2 sets')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Workout' })).toBeInTheDocument();
  });

  it('shows the start action for incomplete workouts and delegates menu callbacks', () => {
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();
    const onEdit = vi.fn();
    const onStart = vi.fn();
    const onToggleComplete = vi.fn();

    render(
      <WorkoutCard
        workout={upcomingWorkout}
        exercises={exercises}
        onStart={onStart}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /start workout/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Workout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate Workout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Workout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Workout' }));

    expect(onStart).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
    expect(onDuplicate).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
    expect(onToggleComplete).toHaveBeenCalled();
    expect(screen.queryByText('Completed')).not.toBeInTheDocument();
  });
});
