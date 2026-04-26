import { useRef, useState } from 'react';
import { buildExportPayload, parseImportPayload } from '@/lib/dashboard';
import { migrateExercises } from '@/lib/migrations';
import { STORAGE_KEYS, saveToStorage } from '@/lib/storage';
import type { ImportPayload } from '@/lib/dashboard';
import type { Exercise, Settings, Workout } from '@/types';

interface UseDashboardDataManagementOptions {
  exercises: Exercise[];
  resetAllData: () => void;
  settings: Settings;
  workouts: Workout[];
}

export function useDashboardDataManagement({
  exercises,
  resetAllData,
  settings,
  workouts,
}: UseDashboardDataManagementOptions) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingImportRef = useRef<ImportPayload | null>(null);

  return {
    fileInputRef,
    importError,
    showImportDialog,
    showResetDialog,
    handleResetData: () => {
      resetAllData();
      setShowResetDialog(false);
    },
    handleExportData: () => {
      const exportData = buildExportPayload({ exercises, workouts, settings });
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `fitness-app-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    handleImportClick: () => {
      fileInputRef.current?.click();
    },
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const content = loadEvent.target?.result as string;
          pendingImportRef.current = parseImportPayload(content);
          setImportError(null);
        } catch (error) {
          pendingImportRef.current = null;
          setImportError(error instanceof Error ? error.message : 'Failed to import data. Please try again.');
        }

        setShowImportDialog(true);
      };

      reader.readAsText(file);
      event.target.value = '';
    },
    handleConfirmImport: () => {
      const importData = pendingImportRef.current;

      if (!importData) {
        return;
      }

      try {
        saveToStorage(STORAGE_KEYS.EXERCISES, migrateExercises(importData.exercises));
        saveToStorage(STORAGE_KEYS.WORKOUTS, importData.workouts);
        if (importData.settings) {
          saveToStorage(STORAGE_KEYS.SETTINGS, importData.settings);
        }

        pendingImportRef.current = null;
        window.location.reload();
      } catch {
        setImportError('Failed to import data. Please try again.');
      }
    },
    closeImportDialog: () => {
      setShowImportDialog(false);
      setImportError(null);
      pendingImportRef.current = null;
    },
    setShowResetDialog,
  };
}
