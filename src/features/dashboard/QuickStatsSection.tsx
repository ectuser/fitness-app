import { Card } from '@/components/ui/card'

interface QuickStatsSectionProps {
  completedWorkoutsCount: number
  exercisesCount: number
  totalSets: number
  upcomingWorkoutsCount: number
}

export function QuickStatsSection({
  completedWorkoutsCount,
  exercisesCount,
  totalSets,
  upcomingWorkoutsCount,
}: QuickStatsSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{exercisesCount}</div>
          <div className="text-sm text-muted-foreground">Exercises</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{upcomingWorkoutsCount}</div>
          <div className="text-sm text-muted-foreground">Upcoming</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{completedWorkoutsCount}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalSets}</div>
          <div className="text-sm text-muted-foreground">Total Sets</div>
        </Card>
      </div>
    </section>
  )
}
