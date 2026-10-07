import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { m } from '#/paraglide/messages'
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
    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
      <span className="w-12 text-sm font-medium text-muted-foreground">
        {m.happy_peach_panda({ number: setNumber })}
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
            placeholder={m.wild_green_swan()}
            className="text-base h-11"
          />
        </div>

        <span className="text-sm text-muted-foreground">{set.weightUnit}</span>

        <span className="mx-1 text-muted-foreground">×</span>

        <div className="flex-1">
          <Input
            type="number"
            inputMode="numeric"
            value={set.reps || ''}
            onChange={(e) =>
              onChange({ ...set, reps: parseInt(e.target.value) || 0 })
            }
            placeholder={m.lively_white_rabbit()}
            className="text-base h-11"
            min="0"
            step="1"
          />
        </div>

        <span className="text-sm text-muted-foreground">
          {m.tidy_peach_badger()}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0"
        aria-label={m.rapid_rose_turtle({ number: setNumber })}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}
