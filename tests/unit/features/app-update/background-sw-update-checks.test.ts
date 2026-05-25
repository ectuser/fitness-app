import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BACKGROUND_SW_UPDATE_CHECK_INTERVAL_MS,
  checkForSwUpdate,
  startBackgroundSwUpdateChecks,
} from '@/features/app-update/background-sw-update-checks'

function createRegistration(options?: { installing?: ServiceWorker | null }) {
  return {
    installing: options?.installing ?? null,
    update: vi.fn().mockResolvedValue(undefined),
  } as unknown as ServiceWorkerRegistration
}

describe('background SW update checks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not schedule checks when registration is missing', () => {
    const setInterval = vi.fn()
    const addEventListener = vi.fn()

    const stop = startBackgroundSwUpdateChecks('/sw.js', undefined, {
      setInterval,
      addEventListener,
    })

    expect(setInterval).not.toHaveBeenCalled()
    expect(addEventListener).not.toHaveBeenCalled()
    expect(stop).toEqual(expect.any(Function))
    stop()
  })

  it('checks for updates on the hourly interval', async () => {
    const registration = createRegistration()
    const fetch = vi.fn().mockResolvedValue({ status: 200 })

    startBackgroundSwUpdateChecks('/sw.js', registration, { fetch })

    await vi.advanceTimersByTimeAsync(BACKGROUND_SW_UPDATE_CHECK_INTERVAL_MS)

    expect(fetch).toHaveBeenCalledWith('/sw.js', {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })
    expect(registration.update).toHaveBeenCalledTimes(1)
  })

  it('checks for updates when the document returns to the foreground', async () => {
    const registration = createRegistration()
    const fetch = vi.fn().mockResolvedValue({ status: 200 })
    let visibilityHandler: (() => void) | undefined
    const addEventListener = vi.fn(
      (_event: string, handler: EventListenerOrEventListenerObject) => {
        visibilityHandler = handler as () => void
      },
    )

    startBackgroundSwUpdateChecks('/sw.js', registration, {
      fetch,
      addEventListener,
      isDocumentVisible: () => true,
    })

    visibilityHandler?.()
    await Promise.resolve()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(registration.update).toHaveBeenCalledTimes(1)
  })

  it('skips foreground checks while the document is hidden', async () => {
    const registration = createRegistration()
    const fetch = vi.fn().mockResolvedValue({ status: 200 })
    let visibilityHandler: (() => void) | undefined
    const addEventListener = vi.fn(
      (_event: string, handler: EventListenerOrEventListenerObject) => {
        visibilityHandler = handler as () => void
      },
    )

    startBackgroundSwUpdateChecks('/sw.js', registration, {
      fetch,
      addEventListener,
      isDocumentVisible: () => false,
    })

    visibilityHandler?.()
    await Promise.resolve()

    expect(fetch).not.toHaveBeenCalled()
    expect(registration.update).not.toHaveBeenCalled()
  })

  it('does not call registration.update when the service worker script fetch fails', async () => {
    const registration = createRegistration()
    const fetch = vi.fn().mockResolvedValue({ status: 404 })

    await checkForSwUpdate('/sw.js', registration, { fetch })

    expect(registration.update).not.toHaveBeenCalled()
  })

  it('does not call registration.update while a service worker is installing', async () => {
    const registration = createRegistration({ installing: {} as ServiceWorker })
    const fetch = vi.fn().mockResolvedValue({ status: 200 })

    await checkForSwUpdate('/sw.js', registration, { fetch })

    expect(fetch).not.toHaveBeenCalled()
    expect(registration.update).not.toHaveBeenCalled()
  })
})
