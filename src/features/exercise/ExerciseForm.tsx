import { useState } from 'react'
import { X } from 'lucide-react'
import { ALL_MUSCLE_GROUPS } from './exercise-helpers'
import type { Exercise, MuscleGroup } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface ExerciseFormProps {
  exercise?: Exercise
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => void | Promise<void>
  onCancel: () => void
}

export function ExerciseForm({
  exercise,
  onSave,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || '')
  const [selectedMuscles, setSelectedMuscles] = useState<Array<MuscleGroup>>(
    exercise?.muscleGroups || [],
  )
  const [comments, setComments] = useState(exercise?.comments || '')
  const [error, setError] = useState('')

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Exercise name is required')
      return
    }

    if (selectedMuscles.length === 0) {
      setError('Please select at least one muscle group')
      return
    }

    onSave({
      name: name.trim(),
      muscleGroups: selectedMuscles,
      comments: comments.trim() || undefined,
      isCustom: true,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive-muted p-3 text-sm text-destructive-muted-foreground">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Exercise Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Barbell Rows"
          className="text-base"
        />
      </div>

      <div className="space-y-3">
        <Label>Muscle Groups</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_MUSCLE_GROUPS.map((muscle) => {
            const isSelected = selectedMuscles.includes(muscle)
            return (
              <button
                key={muscle}
                type="button"
                onClick={() => toggleMuscle(muscle)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-card text-card-foreground hover:border-ring'
                }`}
              >
                {muscle}
              </button>
            )
          })}
        </div>
        {selectedMuscles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedMuscles.map((muscle) => (
              <Badge
                key={muscle}
                variant="secondary"
                className="text-sm px-3 py-1"
              >
                {muscle}
                <button
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comments (Optional)</Label>
        <textarea
          id="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add notes about form, tips, or variations..."
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div
        role="group"
        aria-label="Exercise form actions"
        className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
      >
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="outline">
          Save Exercise
        </Button>
      </div>
    </form>
  )
}
