import { queryOptions } from '@tanstack/react-query'
import { authClient } from './auth-client'

// null means Guest mode, a session means Account mode. A failed request throws
// so a backend outage is never mistaken for Guest.
export const sessionQueryOptions = queryOptions({
  queryKey: ['auth', 'session'],
  queryFn: async () => {
    const { data, error } = await authClient.getSession()
    if (error) throw error
    return data
  },
})
