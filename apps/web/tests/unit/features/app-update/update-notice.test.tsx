import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateNotice } from '@/features/app-update/UpdateNotice'
import { PwaUpdateStatusProvider } from '@/features/app-update/pwa-update-status'

const navigate = vi.fn()

vi.mock('@/lib/router-compat', () => ({
  useNavigate: () => navigate,
}))

describe('UpdateNotice', () => {
  beforeEach(() => {
    navigate.mockClear()
  })

  it('appears only when an Available Update exists', () => {
    const { rerender } = render(
      <PwaUpdateStatusProvider value={{ state: 'up-to-date' }}>
        <UpdateNotice />
      </PwaUpdateStatusProvider>,
    )

    expect(
      screen.queryByRole('button', { name: /available update/i }),
    ).toBeNull()

    rerender(
      <PwaUpdateStatusProvider
        value={{ state: 'available-update', applyUpdate: vi.fn() }}
      >
        <UpdateNotice />
      </PwaUpdateStatusProvider>,
    )

    expect(
      screen.getByRole('button', { name: /available update/i }),
    ).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /update now/i }),
    ).not.toBeInTheDocument()
  })

  it('navigates to the App Update Page when clicked', () => {
    render(
      <PwaUpdateStatusProvider
        value={{ state: 'available-update', applyUpdate: vi.fn() }}
      >
        <UpdateNotice />
      </PwaUpdateStatusProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /available update/i }))

    expect(navigate).toHaveBeenCalledWith('/app-update')
  })

  it('dismisses the notice without clearing the Available Update state', () => {
    const applyUpdate = vi.fn()

    render(
      <PwaUpdateStatusProvider
        value={{ state: 'available-update', applyUpdate }}
      >
        <UpdateNotice />
      </PwaUpdateStatusProvider>,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /dismiss update notice/i }),
    )

    expect(
      screen.queryByRole('button', { name: /available update/i }),
    ).not.toBeInTheDocument()
    expect(applyUpdate).not.toHaveBeenCalled()
  })
})
