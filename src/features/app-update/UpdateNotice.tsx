import { RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { usePwaUpdateStatus } from './pwa-update-status'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useNavigate } from '@/lib/router-compat'

export function UpdateNotice() {
  const updateStatus = usePwaUpdateStatus()
  const navigate = useNavigate()
  const [isDismissed, setIsDismissed] = useState(false)

  if (updateStatus.state !== 'available-update' || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md',
        'md:inset-x-auto md:right-6 md:bottom-6 md:mx-0 md:w-96',
      )}
    >
      <div className="flex overflow-hidden rounded-md border border-border bg-card shadow-lg shadow-foreground/10">
        <button
          type="button"
          onClick={() => navigate('/app-update')}
          aria-label="Available Update: review update details"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info-muted text-info-muted-foreground">
            <RefreshCw className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground">
              Available Update
            </span>
            <span className="block text-xs leading-5 text-muted-foreground">
              Review details before reloading the app.
            </span>
          </span>
        </button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Dismiss update notice"
          onClick={() => setIsDismissed(true)}
          className="m-2 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
