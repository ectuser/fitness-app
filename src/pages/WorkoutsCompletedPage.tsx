import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { WorkoutList } from '@/components/workout/WorkoutList';

export function WorkoutsCompletedPage() {
  const navigate = useNavigate();
  const { workouts, exercises, addWorkout, deleteWorkout, updateWorkout } = useData();

  const completedWorkouts = workouts
    .filter((w) => w.isCompleted)
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || a.date);
      const dateB = new Date(b.completedAt || b.date);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });

  const handleStart = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/session`);
  };

  const handleEdit = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/edit`);
  };

  const handleDuplicate = (workoutId: string) => {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;

    const today = new Date();
    const newDate = today.toISOString().split('T')[0];

    const duplicatedWorkout = {
      name: `${workout.name} (Copy)`,
      date: newDate,
      exercises: workout.exercises.map((we) => ({
        ...we,
        sets: we.sets.map((set) => ({
          ...set,
          id: crypto.randomUUID(),
        })),
      })),
      isCompleted: false,
    };

    addWorkout(duplicatedWorkout);
  };

  const handleDelete = (workoutId: string) => {
    deleteWorkout(workoutId);
  };

  const handleToggleComplete = (workoutId: string) => {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;

    updateWorkout(workoutId, {
      isCompleted: !workout.isCompleted,
      completedAt: !workout.isCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div>
      <PageHeader title="Completed Workouts" showBack />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <Button variant="outline" onClick={() => navigate('/workouts')}>
            Upcoming
          </Button>
          <Button variant="default">Completed</Button>
        </div>

        {completedWorkouts.length > 0 ? (
          <WorkoutList
            workouts={completedWorkouts}
            exercises={exercises}
            onStart={handleStart}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <Card className="p-12 text-center">
            <p className="text-slate-500 mb-2">No completed workouts yet.</p>
            <p className="text-sm text-slate-500">
              Complete a workout to see it here!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
