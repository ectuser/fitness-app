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
      <div className="flex overflow-hidden rounded-md border border-sky-200 bg-white shadow-lg shadow-slate-900/10">
        <button
          type="button"
          onClick={() => navigate('/app-update')}
          aria-label="Available Update: review update details"
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sky-100 text-sky-700">
            <RefreshCw className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-950">
              Available Update
            </span>
            <span className="block text-xs leading-5 text-slate-600">
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
          className="m-2 shrink-0 text-slate-500 hover:text-slate-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
