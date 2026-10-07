import { CheckCircle2, Info, RefreshCw, WifiOff } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getCurrentDeploymentVersion } from './deployment-version'
import { usePwaUpdateStatus } from './pwa-update-status'
import type { PwaUpdateStatus } from './pwa-update-status'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type PwaUpdateState = PwaUpdateStatus['state']

export function AppUpdatePage() {
  const updateStatus = usePwaUpdateStatus()

  const canApplyUpdate = updateStatus.state === 'available-update'
  const isApplying = updateStatus.state === 'applying'

  const handleApplyUpdate = () => {
    if (!canApplyUpdate) {
      return
    }

    void updateStatus.applyUpdate()
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">
          {m.lively_sage_crane()}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {m.odd_lime_finch()}
        </p>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <StatusIcon state={updateStatus.state} />
            {getStatusTitle(updateStatus.state)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
          <StatusDescription state={updateStatus.state} />

          <div className="rounded-md border bg-muted p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <p>{m.cosy_plum_dove()}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {m.sleepy_azure_raven({ version: getCurrentDeploymentVersion() })}
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            {(canApplyUpdate || isApplying) && (
              <Button
                type="button"
                onClick={handleApplyUpdate}
                disabled={isApplying}
                className="sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                {isApplying ? m.happy_green_deer() : m.happy_indigo_trout()}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="sm:w-auto"
            >
              {m.noble_olive_panda()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusIcon({ state }: { state: PwaUpdateState }) {
  if (state === 'available-update' || state === 'applying') {
    return <RefreshCw className="h-5 w-5 text-info" />
  }

  if (state === 'unavailable') {
    return <WifiOff className="h-5 w-5 text-muted-foreground" />
  }

  return <CheckCircle2 className="h-5 w-5 text-success" />
}

function getStatusTitle(state: PwaUpdateState) {
  switch (state) {
    case 'available-update':
      return m.loyal_rose_goat()
    case 'applying':
      return m.sleepy_red_falcon()
    case 'unavailable':
      return m.loyal_mauve_finch()
    case 'up-to-date':
      return m.merry_orange_goat()
  }
}

function StatusDescription({ state }: { state: PwaUpdateState }) {
  if (state === 'available-update') {
    return <p>{m.crisp_gold_owl()}</p>
  }

  if (state === 'applying') {
    return <p>{m.tender_crimson_turtle()}</p>
  }

  if (state === 'unavailable') {
    return <p>{m.brave_ruby_ibis()}</p>
  }

  return <p>{m.tender_cyan_camel()}</p>
}
