import { describe, expect, it } from 'vitest';
import {
  addOrReplaceWorkoutExercise,
  createWorkoutExerciseFromExercise,
  formatDefaultWorkoutName,
  getExerciseReplacementFilterGroup,
  moveWorkoutExercise,
  removeWorkoutExerciseAtIndex,
  updateWorkoutExerciseAtIndex,
  validateWorkoutForm,
} from '@/lib/workout-editor';
import { clone, completedBenchWorkout, completedRowWorkout, createWorkoutExercise, exercises } from '../fixtures';

describe('workout editor helpers', () => {
  it('builds workout exercises from previous completed workouts when available', () => {
    const workoutExercise = createWorkoutExerciseFromExercise(
      exercises[0],
      [completedBenchWorkout, completedRowWorkout],
      'lb',
      0,
      () => '77777777-7777-7777-7777-777777777777'
    );

    expect(workoutExercise.comment).toBe('Drive through your feet.');
    expect(workoutExercise.sets).toEqual([
      {
        id: '77777777-7777-7777-7777-777777777777',
        weight: 105,
        weightUnit: 'kg',
        reps: 3,
      },
    ]);
  });

  it('falls back to default settings and exercise comments when there is no history', () => {
    const workoutExercise = createWorkoutExerciseFromExercise(
      exercises[2],
      [],
      'lb',
      1,
      () => '88888888-8888-8888-8888-888888888888'
    );

    expect(workoutExercise).toEqual({
      exerciseId: 'exercise-plank',
      order: 1,
      comment: '',
      sets: [
        {
          id: '88888888-8888-8888-8888-888888888888',
          weight: 0,
          weightUnit: 'lb',
          reps: 0,
        },
      ],
    });
  });

  it('adds, replaces, moves, removes, and updates workout exercises', () => {
    const initialExercises = [
      createWorkoutExercise('exercise-bench'),
      createWorkoutExercise('exercise-row', { order: 1 }),
    ];

    const appended = addOrReplaceWorkoutExercise(initialExercises, exercises[2], [], 'kg', null);
    expect(appended).toHaveLength(3);

    const replaced = addOrReplaceWorkoutExercise(initialExercises, exercises[2], [], 'kg', 0);
    expect(replaced[0].exerciseId).toBe('exercise-plank');

    expect(moveWorkoutExercise(initialExercises, 1, 'up').map((exercise) => exercise.exerciseId)).toEqual([
      'exercise-row',
      'exercise-bench',
    ]);
    expect(removeWorkoutExerciseAtIndex(initialExercises, 0)[0].order).toBe(0);

    const updated = updateWorkoutExerciseAtIndex(
      initialExercises,
      1,
      createWorkoutExercise('exercise-row', { order: 1, comment: 'Updated' })
    );
    expect(updated[1].comment).toBe('Updated');
  });

  it('returns the replacement filter group and validates workout forms', () => {
    const workoutExercises = [
      createWorkoutExercise('exercise-bench'),
      createWorkoutExercise('exercise-row', { order: 1 }),
    ];

    expect(getExerciseReplacementFilterGroup(workoutExercises, exercises, 1)).toBe('Back');
    expect(validateWorkoutForm('', [])).toEqual({
      name: 'Workout name is required',
      exercises: 'Add at least one exercise',
    });
    expect(validateWorkoutForm('Upper', clone(workoutExercises))).toEqual({});
  });

  it('formats default names and leaves out-of-bounds moves unchanged', () => {
    expect(formatDefaultWorkoutName(new Date('2026-04-01T00:00:00.000Z'))).toBe('Wed, April 1');

    const workoutExercises = [
      createWorkoutExercise('exercise-bench'),
      createWorkoutExercise('exercise-row', { order: 1 }),
    ];

    expect(moveWorkoutExercise(workoutExercises, 0, 'up')).toEqual(workoutExercises);
    expect(moveWorkoutExercise(workoutExercises, 1, 'down')).toEqual(workoutExercises);
    expect(getExerciseReplacementFilterGroup([], exercises, 0)).toBeNull();
  });
});
