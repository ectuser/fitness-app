import { RefreshCw } from 'lucide-react'
import { m } from '#/paraglide/messages'
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
        <h2 className="mb-2 text-lg font-semibold">{m.swift_coral_bison()}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {hasAvailableUpdate ? m.wild_olive_whale() : m.clever_white_tiger()}
        </p>
        <Button asChild variant="outline">
          <Link to="/app-update">
            <RefreshCw className="w-4 h-4" />
            {m.fuzzy_mint_koala()}
          </Link>
        </Button>
      </Card>
    </section>
  )
}
