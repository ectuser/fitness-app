import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/lib/router-compat'

interface DashboardHeaderActionsProps {
  hasAvailableUpdate?: boolean
  onCreateWorkout: () => void
}

export function DashboardHeaderActions({
  hasAvailableUpdate = false,
  onCreateWorkout,
}: DashboardHeaderActionsProps) {
  return (
    <div className="flex gap-2">
      <Button asChild variant="ghost" size="sm" className="relative">
        <Link to="/settings" aria-label="Settings">
          <Settings className="w-4 h-4" />
          {hasAvailableUpdate && (
            <span
              aria-hidden
              className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sky-500"
            />
          )}
        </Link>
      </Button>
      <Button onClick={onCreateWorkout} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        New Workout
      </Button>
    </div>
  )
}
