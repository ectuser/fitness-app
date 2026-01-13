import type { Exercise } from '@/types';

// Preconfigured exercises that will be loaded on first app launch
export const SEED_EXERCISES: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Chest
  {
    name: 'Bench Press',
    muscleGroups: ['Chest', 'Arms'],
    isCustom: false,
    comments: 'Compound chest exercise, great for building upper body strength',
  },
  {
    name: 'Push-ups',
    muscleGroups: ['Chest', 'Arms', 'Core'],
    isCustom: false,
    comments: 'Bodyweight exercise that can be done anywhere',
  },
  {
    name: 'Dumbbell Flyes',
    muscleGroups: ['Chest'],
    isCustom: false,
    comments: 'Isolation exercise for chest',
  },

  // Back
  {
    name: 'Pull-ups',
    muscleGroups: ['Back', 'Arms'],
    isCustom: false,
    comments: 'Excellent compound exercise for back and biceps',
  },
  {
    name: 'Bent Over Rows',
    muscleGroups: ['Back'],
    isCustom: false,
    comments: 'Great for building back thickness',
  },
  {
    name: 'Deadlift',
    muscleGroups: ['Back', 'Legs', 'Core'],
    isCustom: false,
    comments: 'The king of compound exercises, works entire posterior chain',
  },

  // Legs
  {
    name: 'Squats',
    muscleGroups: ['Legs', 'Core'],
    isCustom: false,
    comments: 'Fundamental leg exercise for building overall strength',
  },
  {
    name: 'Lunges',
    muscleGroups: ['Legs'],
    isCustom: false,
    comments: 'Unilateral leg exercise for balance and strength',
  },
  {
    name: 'Leg Press',
    muscleGroups: ['Legs'],
    isCustom: false,
    comments: 'Machine-based leg exercise',
  },

  // Shoulders
  {
    name: 'Shoulder Press',
    muscleGroups: ['Shoulders', 'Arms'],
    isCustom: false,
    comments: 'Compound shoulder exercise',
  },
  {
    name: 'Lateral Raises',
    muscleGroups: ['Shoulders'],
    isCustom: false,
    comments: 'Isolation exercise for side delts',
  },

  // Arms
  {
    name: 'Bicep Curls',
    muscleGroups: ['Arms'],
    isCustom: false,
    comments: 'Classic isolation exercise for biceps',
  },
  {
    name: 'Tricep Dips',
    muscleGroups: ['Arms'],
    isCustom: false,
    comments: 'Compound exercise for triceps',
  },

  // Core
  {
    name: 'Plank',
    muscleGroups: ['Core'],
    isCustom: false,
    comments: 'Isometric core exercise for stability',
  },
  {
    name: 'Russian Twists',
    muscleGroups: ['Core'],
    isCustom: false,
    comments: 'Rotational core exercise',
  },
];

// Helper function to initialize exercises with IDs and timestamps
export function initializeSeedExercises(): Exercise[] {
  return SEED_EXERCISES.map((exercise) => ({
    ...exercise,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }));
}
