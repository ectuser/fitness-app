import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { nextWorkout, upcomingWorkouts, exercises, workouts } = useData();

  const completedWorkouts = workouts.filter((w) => w.isCompleted);

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
          <Button onClick={() => navigate('/workouts/new')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Workout
          </Button>
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
    </div>
  );
}
