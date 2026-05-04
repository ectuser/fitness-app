import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SetInput } from '@/components/workout/SetInput';

describe('SetInput', () => {
  it('syncs displayed weight when external weight changes for same set id', () => {
    const onChange = vi.fn();
    const onRemove = vi.fn();

    const { rerender } = render(
      <SetInput
        onChange={onChange}
        onRemove={onRemove}
        set={{
          id: 'set-1',
          reps: 8,
          weight: 20,
          weightUnit: 'kg',
        }}
        setNumber={1}
      />
    );

    const weightInput = screen.getByPlaceholderText('Weight');
    expect(weightInput).toHaveValue('20');

    rerender(
      <SetInput
        onChange={onChange}
        onRemove={onRemove}
        set={{
          id: 'set-1',
          reps: 8,
          weight: 35.5,
          weightUnit: 'kg',
        }}
        setNumber={1}
      />
    );

    expect(weightInput).toHaveValue('35.5');
  });

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

    const callCountBeforeCommaDecimal = onChange.mock.calls.length;
    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '50,257' },
    });
    expect(onChange).toHaveBeenCalledTimes(callCountBeforeCommaDecimal + 1);
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

    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '12abc' },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      id: 'set-1',
      reps: 8,
      weight: 0,
      weightUnit: 'kg',
    });

    fireEvent.change(screen.getByPlaceholderText('Weight'), {
      target: { value: '1..2' },
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
