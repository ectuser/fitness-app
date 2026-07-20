import { useId } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface SimpleModalProps {
  children: ReactNode
  description?: ReactNode
  onClose: () => void
  open: boolean
  role?: 'alertdialog' | 'dialog'
  title: ReactNode
}

export function SimpleModal({
  children,
  description,
  onClose,
  open,
  role = 'dialog',
  title,
}: SimpleModalProps) {
  const titleId = useId()
  const descriptionId = useId()

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-4">
      <div
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-lg"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2
            id={titleId}
            className="text-lg font-semibold leading-none tracking-tight"
          >
            {title}
          </h2>
          {description ? (
            <div id={descriptionId} className="text-sm text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
