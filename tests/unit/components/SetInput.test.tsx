import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SetInput } from '@/components/workout/SetInput';

describe('SetInput', () => {
  it('normalizes weight and reps updates and removes a set', () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();

    render(
      <SetInput
        onChange={onChange}
        onRemove={onRemove}
        set={{
          id: 'set-1',
          reps: 8,
          weight: 20,
          weightUnit: 'kg',
        }}
        setNumber={2}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '50.257' },
    });
    expect(onChange).toHaveBeenCalledWith({
      id: 'set-1',
      reps: 8,
      weight: 50.25,
      weightUnit: 'kg',
    });

    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '50,257' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'set-1',
      reps: 8,
      weight: 50.25,
      weightUnit: 'kg',
    });

    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '-5' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'set-1',
      reps: 8,
      weight: 0,
      weightUnit: 'kg',
    });

    fireEvent.change(screen.getByPlaceholderText('Reps'), {
      target: { value: '11' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'set-1',
      reps: 11,
      weight: 20,
      weightUnit: 'kg',
    });

    fireEvent.change(screen.getByPlaceholderText('Reps'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'set-1',
      reps: 0,
      weight: 20,
      weightUnit: 'kg',
    });

    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalled();
  });
});
