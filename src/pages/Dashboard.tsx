import { PageHeader } from '@/components/layout/PageHeader';
import { useNavigate } from '@/lib/router-compat';
import { useData } from '@/context/DataContext';
import { getWorkoutTotalSets } from '@/lib/workouts';
import { useDashboardDataManagement } from '@/hooks/useDashboardDataManagement';
import { DashboardDialogs } from '@/components/dashboard/DashboardDialogs';
import { DashboardHeaderActions } from '@/components/dashboard/DashboardHeaderActions';
import { NextWorkoutSection } from '@/components/dashboard/NextWorkoutSection';
import { QuickStatsSection } from '@/components/dashboard/QuickStatsSection';
import { UpcomingWorkoutsSection } from '@/components/dashboard/UpcomingWorkoutsSection';

export function Dashboard() {
  const navigate = useNavigate();
  const { nextWorkout, upcomingWorkouts, exercises, workouts, settings, resetAllData } = useData();
  const {
    closeImportDialog,
    fileInputRef,
    handleConfirmImport,
    handleExportData,
    handleFileChange,
    handleImportClick,
    handleResetData,
    importError,
    setShowResetDialog,
    showImportDialog,
    showResetDialog,
  } = useDashboardDataManagement({
    exercises,
    workouts,
    settings,
    resetAllData,
  });

  const completedWorkouts = workouts.filter((workout) => workout.isCompleted);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <DashboardHeaderActions
            fileInputRef={fileInputRef}
            onCreateWorkout={() => navigate('/workouts/new')}
            onExportData={handleExportData}
            onFileChange={handleFileChange}
            onImportClick={handleImportClick}
            onOpenResetDialog={() => setShowResetDialog(true)}
          />
        }
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        <NextWorkoutSection
          exercises={exercises}
          nextWorkout={nextWorkout}
          onCreateWorkout={() => navigate('/workouts/new')}
          onStartWorkout={(workoutId) => navigate(`/workouts/${workoutId}/session`)}
        />
        <UpcomingWorkoutsSection
          exercises={exercises}
          workouts={upcomingWorkouts}
          onShowAll={() => navigate('/workouts')}
          onStartWorkout={(workoutId) => navigate(`/workouts/${workoutId}/session`)}
        />
        <QuickStatsSection
          exercisesCount={exercises.length}
          upcomingWorkoutsCount={upcomingWorkouts.length}
          completedWorkoutsCount={completedWorkouts.length}
          totalSets={completedWorkouts.reduce(
            (sum, workout) => sum + getWorkoutTotalSets(workout),
            0
          )}
        />
      </div>

      <DashboardDialogs
        importError={importError}
        onCloseImportDialog={closeImportDialog}
        onConfirmImport={handleConfirmImport}
        onConfirmReset={handleResetData}
        openImportDialog={showImportDialog}
        openResetDialog={showResetDialog}
        setOpenResetDialog={setShowResetDialog}
      />
    </div>
  );
}
