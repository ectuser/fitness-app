import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkoutList } from '@/features/workout/WorkoutList';
import { completedBenchWorkout, exercises, upcomingWorkout } from '../fixtures';

vi.mock('@/features/workout/WorkoutCard', () => ({
  WorkoutCard: ({
    onDelete,
    onDuplicate,
    onEdit,
    onStart,
    onToggleComplete,
    workout,
  }: {
    onDelete: () => void;
    onDuplicate: () => void;
    onEdit: () => void;
    onStart: () => void;
    onToggleComplete: () => void;
    workout: { name: string };
  }) => (
    <div>
      <span>{workout.name}</span>
      <button type="button" onClick={onStart}>
        Start
      </button>
      <button type="button" onClick={onEdit}>
        Edit
      </button>
      <button type="button" onClick={onDuplicate}>
        Duplicate
      </button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
      <button type="button" onClick={onToggleComplete}>
        Toggle
      </button>
    </div>
  ),
}));

describe('WorkoutList', () => {
  it('returns null for empty lists and renders workout cards otherwise', () => {
    const { rerender, container } = render(
      <WorkoutList
        workouts={[]}
        exercises={exercises}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();

    rerender(
      <WorkoutList
        workouts={[completedBenchWorkout, upcomingWorkout]}
        exercises={exercises}
        onStart={vi.fn()}
        onEdit={vi.fn()}
        onDuplicate={vi.fn()}
        onDelete={vi.fn()}
        onToggleComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Push Day')).toBeInTheDocument();
    expect(screen.getByText('Leg Day')).toBeInTheDocument();
  });

  it('binds item callbacks to each workout id', () => {
    const onDelete = vi.fn();
    const onDuplicate = vi.fn();
    const onEdit = vi.fn();
    const onStart = vi.fn();
    const onToggleComplete = vi.fn();

    render(
      <WorkoutList
        workouts={[completedBenchWorkout, upcomingWorkout]}
        exercises={exercises}
        onStart={onStart}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Start' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Toggle' })[1]);

    expect(onStart).toHaveBeenCalledWith(upcomingWorkout.id);
    expect(onEdit).toHaveBeenCalledWith(upcomingWorkout.id);
    expect(onDuplicate).toHaveBeenCalledWith(upcomingWorkout.id);
    expect(onDelete).toHaveBeenCalledWith(upcomingWorkout.id);
    expect(onToggleComplete).toHaveBeenCalledWith(upcomingWorkout.id);
  });
});
