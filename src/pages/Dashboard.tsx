import { useState, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Play, Calendar, Settings, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { STORAGE_KEYS, saveToStorage } from '@/lib/storage';

export function Dashboard() {
  const navigate = useNavigate();
  const { nextWorkout, upcomingWorkouts, exercises, workouts, settings, resetAllData } = useData();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedWorkouts = workouts.filter((w) => w.isCompleted);

  const handleResetData = () => {
    resetAllData();
    setShowResetDialog(false);
  };

  const handleExportData = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        exercises,
        workouts,
        settings,
      },
    };

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
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        // Validate import data structure
        if (!importData.data || !importData.data.exercises || !importData.data.workouts) {
          setImportError('Invalid backup file format. Missing required data.');
          setShowImportDialog(true);
          return;
        }

        // Show confirmation dialog
        setImportError(null);
        setShowImportDialog(true);

        // Store the parsed data temporarily for import
        (window as any).__importData = importData.data;
      } catch (error) {
        setImportError('Failed to read backup file. Please make sure it\'s a valid JSON file.');
        setShowImportDialog(true);
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleConfirmImport = () => {
    const importData = (window as any).__importData;
    if (!importData) return;

    try {
      // Save imported data to localStorage
      saveToStorage(STORAGE_KEYS.EXERCISES, importData.exercises);
      saveToStorage(STORAGE_KEYS.WORKOUTS, importData.workouts);
      if (importData.settings) {
        saveToStorage(STORAGE_KEYS.SETTINGS, importData.settings);
      }

      // Clean up temporary data
      delete (window as any).__importData;

      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      setImportError('Failed to import data. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getWorkoutMuscles = (workout: typeof nextWorkout) => {
    if (!workout) return [];
    const workoutExercises = workout.exercises
      .map((we) => exercises.find((e) => e.id === we.exerciseId))
      .filter((e) => e !== undefined);
    return Array.from(new Set(workoutExercises.flatMap((e) => e.muscleGroups)));
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowResetDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  Reset Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={() => navigate('/workouts/new')} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Workout
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Next Workout Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Next Workout</h2>
          {nextWorkout ? (
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">{nextWorkout.name}</h3>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(nextWorkout.date)}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {getWorkoutMuscles(nextWorkout).map((muscle) => (
                    <Badge key={muscle} variant="outline" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-slate-600">
                  {nextWorkout.exercises.length} exercise{nextWorkout.exercises.length !== 1 ? 's' : ''} •{' '}
                  {nextWorkout.exercises.reduce((sum, we) => sum + we.sets.length, 0)} set
                  {nextWorkout.exercises.reduce((sum, we) => sum + we.sets.length, 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/workouts/${nextWorkout.id}/session`)}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout
              </Button>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-slate-500 mb-4">No upcoming workouts.</p>
              <p className="text-sm text-slate-500 mb-4">Create one to get started!</p>
              <Button onClick={() => navigate('/workouts/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workout
              </Button>
            </Card>
          )}
        </section>

        {/* Coming Workouts Section */}
        {upcomingWorkouts.length > 1 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Coming Workouts</h2>
              {upcomingWorkouts.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/workouts')}
                >
                  Show All
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {upcomingWorkouts.slice(1, 5).map((workout) => {
                const muscles = getWorkoutMuscles(workout);
                return (
                  <Card
                    key={workout.id}
                    className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/workouts/${workout.id}/session`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{workout.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(workout.date)}</span>
                        </div>
                        {muscles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {muscles.slice(0, 3).map((muscle) => (
                              <Badge key={muscle} variant="outline" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                            {muscles.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{muscles.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-slate-500">
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workouts/${workout.id}/session`);
                        }}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-2xl font-bold">{exercises.length}</div>
              <div className="text-sm text-slate-600">Exercises</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{upcomingWorkouts.length}</div>
              <div className="text-sm text-slate-600">Upcoming</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">{completedWorkouts.length}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold">
                {completedWorkouts.reduce(
                  (sum, w) => sum + w.exercises.reduce((s, we) => s + we.sets.length, 0),
                  0
                )}
              </div>
              <div className="text-sm text-slate-600">Total Sets</div>
            </Card>
          </div>
        </section>
      </div>

      {/* Reset Data Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your workouts, custom exercises, and
              settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Data Dialog */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {importError ? 'Import Failed' : 'Import Data?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {importError ? (
                <span className="text-red-600">{importError}</span>
              ) : (
                'This will replace all your current data with the imported data. Your existing workouts, exercises, and settings will be overwritten.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowImportDialog(false);
                setImportError(null);
                delete (window as any).__importData;
              }}
            >
              Cancel
            </AlertDialogCancel>
            {!importError && (
              <AlertDialogAction onClick={handleConfirmImport}>
                Import Data
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
