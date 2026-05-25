export const BACKGROUND_SW_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000

type IntervalHandle = ReturnType<typeof globalThis.setInterval>

type BackgroundSwUpdateCheckDeps = {
  fetch: typeof fetch
  setInterval: (handler: () => void, delay: number) => IntervalHandle
  clearInterval: (id: IntervalHandle) => void
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void
  isDocumentVisible: () => boolean
}

const defaultDeps: BackgroundSwUpdateCheckDeps = {
  fetch: (input, init) => fetch(input, init),
  setInterval: (handler, delay) => globalThis.setInterval(handler, delay),
  clearInterval: (id) => globalThis.clearInterval(id),
  addEventListener: (type, listener) =>
    document.addEventListener(type, listener),
  removeEventListener: (type, listener) =>
    document.removeEventListener(type, listener),
  isDocumentVisible: () => document.visibilityState === 'visible',
}

export async function checkForSwUpdate(
  swScriptUrl: string,
  registration: ServiceWorkerRegistration,
  deps: Pick<BackgroundSwUpdateCheckDeps, 'fetch'> = defaultDeps,
): Promise<void> {
  if (registration.installing) {
    return
  }

  if (
    typeof navigator !== 'undefined' &&
    'connection' in navigator &&
    !navigator.onLine
  ) {
    return
  }

  const response = await deps.fetch(swScriptUrl, {
    cache: 'no-store',
    headers: {
      cache: 'no-store',
      'cache-control': 'no-cache',
    },
  })

  if (response.status === 200) {
    await registration.update()
  }
}

export function startBackgroundSwUpdateChecks(
  swScriptUrl: string,
  registration: ServiceWorkerRegistration | undefined,
  deps: Partial<BackgroundSwUpdateCheckDeps> = {},
): () => void {
  const resolvedDeps = { ...defaultDeps, ...deps }

  if (!registration) {
    return () => {}
  }

  const runCheck = () => {
    void checkForSwUpdate(swScriptUrl, registration, resolvedDeps)
  }

  const intervalId = resolvedDeps.setInterval(
    runCheck,
    BACKGROUND_SW_UPDATE_CHECK_INTERVAL_MS,
  )

  const onVisibilityChange = () => {
    if (resolvedDeps.isDocumentVisible()) {
      runCheck()
    }
  }

  resolvedDeps.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    resolvedDeps.clearInterval(intervalId)
    resolvedDeps.removeEventListener('visibilitychange', onVisibilityChange)
  }
}
