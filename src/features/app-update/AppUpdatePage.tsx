import { CheckCircle2, Info, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentDeploymentVersion } from './deployment-version'
import { usePwaUpdateStatus } from './pwa-update-status'
import type { PwaUpdateStatus } from './pwa-update-status'

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
        <h1 className="text-2xl font-bold text-slate-950 md:text-3xl">
          App Update
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Fitness Tracker updates the app shell separately from your workout
          data. Your workouts and settings stay stored in this browser.
        </p>
      </div>

      <Card className="rounded-md border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <StatusIcon state={updateStatus.state} />
            {getStatusTitle(updateStatus.state)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-6 text-slate-600">
          <StatusDescription state={updateStatus.state} />

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <p>
                Applying an Available Update activates the waiting app version
                and reloads the page. Save or finish important changes before
                updating.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Current version: {getCurrentDeploymentVersion()}
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
                {isApplying ? 'Updating...' : 'Update now'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="sm:w-auto"
            >
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusIcon({ state }: { state: PwaUpdateState }) {
  if (state === 'available-update' || state === 'applying') {
    return <RefreshCw className="h-5 w-5 text-sky-600" />
  }

  if (state === 'unavailable') {
    return <WifiOff className="h-5 w-5 text-slate-500" />
  }

  return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
}

function getStatusTitle(state: PwaUpdateState) {
  switch (state) {
    case 'available-update':
      return 'Available Update'
    case 'applying':
      return 'Applying update'
    case 'unavailable':
      return 'Update checks are unavailable'
    case 'up-to-date':
      return "You're up to date"
  }
}

function StatusDescription({
  state,
}: {
  state: PwaUpdateState
}) {
  if (state === 'available-update') {
    return (
      <p>
        A new version of Fitness Tracker is ready. Update when you are ready for
        the app to reload.
      </p>
    )
  }

  if (state === 'applying') {
    return <p>The update is being applied. The app will reload shortly.</p>
  }

  if (state === 'unavailable') {
    return (
      <p>
        This browser environment cannot check for app updates right now. This
        can happen when service workers are blocked or unsupported.
      </p>
    )
  }

  return <p>The current app shell is active. No waiting update is available.</p>
}
