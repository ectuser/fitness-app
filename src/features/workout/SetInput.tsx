import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Set as SetType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SetInputProps {
  set: SetType
  setNumber: number
  onChange: (set: SetType) => void
  onRemove: () => void
}

const normalizeWeight = (value: string): number => {
  const canonicalValue = value.replace(',', '.').trim()
  const isValidNumericPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(
    canonicalValue,
  )

  if (!isValidNumericPattern) {
    return 0
  }

  const parsed = Number.parseFloat(canonicalValue)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return Math.trunc(parsed * 100) / 100
}

export function SetInput({
  set,
  setNumber,
  onChange,
  onRemove,
}: SetInputProps) {
  const [rawWeight, setRawWeight] = useState(
    set.weight === 0 ? '' : String(set.weight),
  )
  const [isEditingWeight, setIsEditingWeight] = useState(false)

  useEffect(() => {
    if (isEditingWeight) {
      return
    }

    setRawWeight(set.weight === 0 ? '' : String(set.weight))
  }, [isEditingWeight, set.id, set.weight])

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
      <span className="text-sm font-medium text-slate-600 w-12">
        Set {setNumber}
      </span>

      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="decimal"
            value={rawWeight}
            onFocus={() => setIsEditingWeight(true)}
            onBlur={() => setIsEditingWeight(false)}
            onChange={(e) => {
              const { value } = e.target
              setRawWeight(value)
              onChange({ ...set, weight: normalizeWeight(value) })
            }}
            placeholder="Weight"
            className="text-base h-11"
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
  )
}
