import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/badge';

export function ExercisesPage() {
  const navigate = useNavigate();
  const { exercises } = useData();

  return (
    <div>
      <PageHeader
        title="Exercises"
        action={
          <Button onClick={() => navigate('/exercises/new')} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 cursor-pointer hover:border-slate-300"
              onClick={() => navigate(`/exercises/${exercise.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{exercise.name}</h3>
                {exercise.isCustom && (
                  <Badge variant="outline" className="text-xs">
                    Custom
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {exercise.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
