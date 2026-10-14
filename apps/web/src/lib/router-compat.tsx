import {
  Link as TanStackLink,
  useLocation,
  useRouter,
  useNavigate as useTanStackNavigate,
  useParams as useTanStackParams,
} from '@tanstack/react-router'
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react'

type NavigateOptions = {
  replace?: boolean
}

type AppNavigate = (to: string | number, options?: NavigateOptions) => void

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string
  children: ReactNode
}

const RouterLink = TanStackLink as ComponentType<Record<string, unknown>>

export function Link({ to, children, ...props }: LinkProps) {
  return (
    <RouterLink to={to} {...props}>
      {children}
    </RouterLink>
  )
}

export { useLocation }

export function useNavigate(): AppNavigate {
  const navigate = useTanStackNavigate()
  const router = useRouter()

  return (to, options) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.history.back()
        return
      }

      window.history.go(to)
      return
    }

    void navigate({
      to,
      replace: options?.replace,
    } as never)
  }
}

export function useParams<
  TParams extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
>(): TParams {
  const getParams = useTanStackParams as unknown as (options: {
    strict: false
  }) => Record<string, string | undefined>

  return getParams({ strict: false }) as TParams
}
