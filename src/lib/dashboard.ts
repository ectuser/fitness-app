import type { Exercise, Settings, Workout } from '@/types';

export interface ImportPayload {
  exercises: Exercise[];
  workouts: Workout[];
  settings?: Settings;
}

export interface ExportPayload {
  version: string;
  exportDate: string;
  data: ImportPayload;
}

export function buildExportPayload(data: ImportPayload, exportDate = new Date().toISOString()): ExportPayload {
  return {
    version: '1.0',
    exportDate,
    data,
  };
}

export function parseImportPayload(content: string): ImportPayload {
  let parsedValue: { data?: ImportPayload };

  try {
    parsedValue = JSON.parse(content) as { data?: ImportPayload };
  } catch {
    throw new Error('Failed to read backup file. Please make sure it\'s a valid JSON file.');
  }

  if (
    !parsedValue.data ||
    !Array.isArray(parsedValue.data.exercises) ||
    !Array.isArray(parsedValue.data.workouts)
  ) {
    throw new Error('Invalid backup file format. Missing required data.');
  }

  return parsedValue.data;
}
