import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import type { Exercise } from '@/types';

export function ExerciseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise } = useData();

  const exercise = id ? exercises.find((e) => e.id === id) : undefined;
  const isEditing = !!id;

  const handleSave = (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    if (isEditing && id) {
      updateExercise(id, exerciseData);
    } else {
      addExercise(exerciseData);
    }
    navigate('/exercises');
  };

  const handleCancel = () => {
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
