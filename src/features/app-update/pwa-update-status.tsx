import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

type AvailableUpdateStatus = {
  state: 'available-update'
  applyUpdate: () => Promise<void>
}

export type PwaUpdateStatus =
  | { state: 'unavailable' }
  | { state: 'up-to-date' }
  | { state: 'applying' }
  | AvailableUpdateStatus

const PwaUpdateStatusContext = createContext<PwaUpdateStatus | null>(null)

interface PwaUpdateStatusProviderProps {
  children: ReactNode
  value?: PwaUpdateStatus
}

export function PwaUpdateStatusProvider({
  children,
  value,
}: PwaUpdateStatusProviderProps) {
  if (value) {
    return (
      <PwaUpdateStatusContext.Provider value={value}>
        {children}
      </PwaUpdateStatusContext.Provider>
    )
  }

  return (
    <RuntimePwaUpdateStatusProvider>{children}</RuntimePwaUpdateStatusProvider>
  )
}

function RuntimePwaUpdateStatusProvider({ children }: { children: ReactNode }) {
  const [registrationState, setRegistrationState] = useState<
    'ready' | 'unavailable'
  >(() => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return 'unavailable'
    }

    return 'ready'
  })
  const [isApplying, setIsApplying] = useState(false)
  const {
    needRefresh: [needsRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_swScriptUrl, registration) => {
      if (!registration) {
        setRegistrationState('unavailable')
        return
      }

      setRegistrationState('ready')
    },
    onRegisterError: () => {
      setRegistrationState('unavailable')
    },
  })

  const status = useMemo<PwaUpdateStatus>(() => {
    if (registrationState === 'unavailable') {
      return { state: 'unavailable' }
    }

    if (isApplying) {
      return { state: 'applying' }
    }

    if (needsRefresh) {
      return {
        state: 'available-update',
        applyUpdate: async () => {
          setIsApplying(true)
          await updateServiceWorker(true)
        },
      }
    }

    return { state: 'up-to-date' }
  }, [isApplying, needsRefresh, registrationState, updateServiceWorker])

  return (
    <PwaUpdateStatusContext.Provider value={status}>
      {children}
    </PwaUpdateStatusContext.Provider>
  )
}

export function usePwaUpdateStatus() {
  const status = useContext(PwaUpdateStatusContext)

  if (!status) {
    throw new Error(
      'usePwaUpdateStatus must be used inside PwaUpdateStatusProvider',
    )
  }

  return status
}
