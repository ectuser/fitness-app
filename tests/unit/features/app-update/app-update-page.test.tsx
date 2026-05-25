import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppUpdatePage } from '@/features/app-update/AppUpdatePage'
import { PwaUpdateStatusProvider } from '@/features/app-update/pwa-update-status'

describe('AppUpdatePage', () => {
  it('renders an available update with an update action', async () => {
    const applyUpdate = vi.fn().mockResolvedValue(undefined)

    render(
      <PwaUpdateStatusProvider
        value={{ state: 'available-update', applyUpdate }}
      >
        <AppUpdatePage />
      </PwaUpdateStatusProvider>,
    )

    expect(screen.getByRole('heading', { name: 'App Update' })).toBeVisible()
    expect(screen.getByText('Available Update')).toBeVisible()
    expect(
      screen.getByText(/save or finish important changes before updating/i),
    ).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Update now' }))

    await waitFor(() => expect(applyUpdate).toHaveBeenCalledTimes(1))
  })

  it('renders an up-to-date state without an update action', () => {
    render(
      <PwaUpdateStatusProvider value={{ state: 'up-to-date' }}>
        <AppUpdatePage />
      </PwaUpdateStatusProvider>,
    )

    expect(screen.getByText("You're up to date")).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Update now' })).toBeNull()
  })

  it('renders an unavailable state without an update action', () => {
    render(
      <PwaUpdateStatusProvider value={{ state: 'unavailable' }}>
        <AppUpdatePage />
      </PwaUpdateStatusProvider>,
    )

    expect(screen.getByText('Update checks are unavailable')).toBeVisible()
    expect(
      screen.getByText(/this browser environment cannot check for app updates/i),
    ).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Update now' })).toBeNull()
  })

  it('disables the update action while applying', () => {
    render(
      <PwaUpdateStatusProvider value={{ state: 'applying' }}>
        <AppUpdatePage />
      </PwaUpdateStatusProvider>,
    )

    expect(screen.getByRole('button', { name: 'Updating...' })).toBeDisabled()
  })
})
