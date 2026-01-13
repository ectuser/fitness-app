import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Set as SetType, WeightUnit } from '@/types';
import { useData } from '@/context/DataContext';

interface SetInputProps {
  set: SetType;
  setNumber: number;
  onChange: (set: SetType) => void;
  onRemove: () => void;
}

export function SetInput({ set, setNumber, onChange, onRemove }: SetInputProps) {
  const { settings } = useData();

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
      <span className="text-sm font-medium text-slate-600 w-12">
        Set {setNumber}
      </span>

      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1">
          <Input
            type="number"
            inputMode="numeric"
            value={set.weight || ''}
            onChange={(e) =>
              onChange({ ...set, weight: parseFloat(e.target.value) || 0 })
            }
            placeholder="Weight"
            className="text-base h-11"
            min="0"
            step="0.5"
          />
        </div>

        <span className="text-sm text-slate-600">{set.weightUnit}</span>

        <span className="text-slate-400 mx-1">×</span>

        <div className="flex-1">
          <Input
            type="number"
            inputMode="numeric"
            value={set.reps || ''}
            onChange={(e) =>
              onChange({ ...set, reps: parseInt(e.target.value) || 0 })
            }
            placeholder="Reps"
            className="text-base h-11"
            min="0"
            step="1"
          />
        </div>

        <span className="text-sm text-slate-600">reps</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
