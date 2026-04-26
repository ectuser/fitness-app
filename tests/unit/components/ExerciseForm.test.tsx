import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { exercises } from '../fixtures';

describe('ExerciseForm', () => {
  it('validates required fields before saving', () => {
    const onSave = vi.fn();

    render(<ExerciseForm onCancel={vi.fn()} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: /save exercise/i }));
    expect(screen.getByText('Exercise name is required')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/exercise name/i), {
      target: { value: 'Incline Curl' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save exercise/i }));

    expect(screen.getByText('Please select at least one muscle group')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves trimmed values and lets the user remove a selected muscle badge', () => {
    const onSave = vi.fn();

    render(<ExerciseForm onCancel={vi.fn()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/exercise name/i), {
      target: { value: '  Incline Curl  ' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Biceps' })[0]);
    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: '  Focus on the squeeze.  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save exercise/i }));

    expect(onSave).toHaveBeenCalledWith({
      comments: 'Focus on the squeeze.',
      isCustom: true,
      muscleGroups: ['Biceps'],
      name: 'Incline Curl',
    });
  });

  it('prefills existing exercise data and supports cancel', () => {
    const onCancel = vi.fn();

    render(<ExerciseForm exercise={exercises[1]} onCancel={onCancel} onSave={vi.fn()} />);

    expect(screen.getByDisplayValue('Barbell Row')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Keep your chest up.')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /cancel/i }).at(-1)!);
    expect(onCancel).toHaveBeenCalled();
  });
});
