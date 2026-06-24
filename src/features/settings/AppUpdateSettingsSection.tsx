import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@/lib/router-compat'

interface AppUpdateSettingsSectionProps {
  hasAvailableUpdate: boolean
}

export function AppUpdateSettingsSection({
  hasAvailableUpdate,
}: AppUpdateSettingsSectionProps) {
  return (
    <section id="app-update">
      <Card className="p-6">
        <h2 className="mb-2 text-lg font-semibold">App Update</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {hasAvailableUpdate
            ? 'An update is available.'
            : 'Check update status and service worker details.'}
        </p>
        <Button asChild variant="outline">
          <Link to="/app-update">
            <RefreshCw className="w-4 h-4" />
            Open App Update
          </Link>
        </Button>
      </Card>
    </section>
  )
}
