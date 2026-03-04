import { migrateExercises } from '@/lib/migrations';
import type { Exercise, Settings, Workout } from '@/types';

export interface BackupData {
  exercises: Exercise[];
  workouts: Workout[];
  settings?: Settings;
}

export interface BackupPayload {
  version: string;
  exportDate: string;
  data: BackupData;
}

export function createBackupPayload(data: BackupData, date = new Date()): BackupPayload {
  return {
    version: '1.0',
    exportDate: date.toISOString(),
    data,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseBackupPayload(content: string): BackupData {
  const parsed: unknown = JSON.parse(content);

  if (!isObject(parsed) || !isObject(parsed.data)) {
    throw new Error('Invalid backup file format. Missing required data.');
  }

  const exercises = parsed.data.exercises;
  const workouts = parsed.data.workouts;
  const settings = parsed.data.settings;

  if (!Array.isArray(exercises) || !Array.isArray(workouts)) {
    throw new Error('Invalid backup file format. Missing required data.');
  }

  return {
    exercises: migrateExercises(exercises as Exercise[]),
    workouts: workouts as Workout[],
    settings: settings as Settings | undefined,
  };
}
