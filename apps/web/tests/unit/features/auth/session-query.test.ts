import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authClient } from '@/features/auth/auth-client'
import { sessionQueryOptions } from '@/features/auth/session-query'

vi.mock('@/features/auth/auth-client', () => ({
  authClient: { getSession: vi.fn() },
}))

const getSession = vi.mocked(authClient.getSession)

describe('session query', () => {
  beforeEach(() => {
    getSession.mockReset()
  })

  it('is keyed under auth/session', () => {
    expect(sessionQueryOptions.queryKey).toEqual(['auth', 'session'])
  })

  it('resolves null for a Guest (no session)', async () => {
    getSession.mockResolvedValue({ data: null, error: null })

    const data = await new QueryClient().fetchQuery(sessionQueryOptions)

    expect(data).toBeNull()
  })

  it('resolves the session for an Account User', async () => {
    const session = { user: { id: 'u1', email: 'ann@example.com' } }
    getSession.mockResolvedValue({ data: session, error: null })

    const data = await new QueryClient().fetchQuery(sessionQueryOptions)

    expect(data).toEqual(session)
  })

  it('rejects when the backend is unavailable instead of falling back to Guest', async () => {
    getSession.mockResolvedValue({
      data: null,
      error: { status: 503, statusText: 'Service Unavailable' },
    })

    await expect(
      new QueryClient().fetchQuery({ ...sessionQueryOptions, retry: false }),
    ).rejects.toMatchObject({ status: 503 })
  })
})
