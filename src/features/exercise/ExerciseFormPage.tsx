import { useNavigate, useParams } from '@/lib/router-compat';
import { PageHeader } from '@/components/layout/PageHeader';
import { getReturnToWorkoutPathFromSearch } from '@/lib/exercise-return-path';
import type { Exercise } from '@/types';
import { ExerciseForm } from './ExerciseForm';
import { useExercises } from './use-exercises';

export function ExerciseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise } = useExercises();

  const exercise = id ? exercises.find((e) => e.id === id) : undefined;
  const isEditing = !!id;
  const returnToWorkoutPath = typeof window === 'undefined'
    ? null
    : getReturnToWorkoutPathFromSearch(window.location.search);

  const handleSave = async (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    if (isEditing && id) {
      await updateExercise(id, exerciseData);
    } else {
      await addExercise(exerciseData);
    }
    if (returnToWorkoutPath) {
      navigate(returnToWorkoutPath, { replace: true });
      return;
    }
    navigate('/exercises');
  };

  const handleCancel = () => {
    if (returnToWorkoutPath) {
      navigate(returnToWorkoutPath, { replace: true });
      return;
    }
    navigate(-1);
  };

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Edit Exercise' : 'Create Exercise'}
        showBack
      />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <ExerciseForm
            exercise={exercise}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
