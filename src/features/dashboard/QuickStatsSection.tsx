import { m } from '#/paraglide/messages'
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
      <h2 className="text-lg font-semibold mb-4">{m.quirky_azure_crane()}</h2>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold">{exercisesCount}</div>
          <div className="text-sm text-muted-foreground">
            {m.smart_lilac_viper()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{upcomingWorkoutsCount}</div>
          <div className="text-sm text-muted-foreground">
            {m.fancy_yellow_seal()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{completedWorkoutsCount}</div>
          <div className="text-sm text-muted-foreground">
            {m.young_rust_duck()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">{totalSets}</div>
          <div className="text-sm text-muted-foreground">
            {m.eager_navy_quail()}
          </div>
        </Card>
      </div>
    </section>
  )
}
