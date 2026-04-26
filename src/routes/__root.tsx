import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DataProvider } from '@/context/DataContext'
import { MainLayout } from '@/components/layout/MainLayout'
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '@/lib/storage'
import { useLocation, useNavigate } from '@/lib/router-compat'

import { getLocale } from '#/paraglide/runtime'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

const RESTORABLE_ROUTE_REGEXES = [
  /^\/$/,
  /^\/workouts$/,
  /^\/workouts\/completed$/,
  /^\/workouts\/new$/,
  /^\/workouts\/[^/]+\/edit$/,
  /^\/workouts\/[^/]+\/session$/,
  /^\/exercises$/,
  /^\/exercises\/new$/,
  /^\/exercises\/[^/]+$/,
  /^\/exercises\/[^/]+\/edit$/,
]

function isRestorableRoute(pathname: string): boolean {
  return RESTORABLE_ROUTE_REGEXES.some((routePattern) =>
    routePattern.test(pathname),
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // Other redirect strategies are possible; see
    // https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#offline-redirect
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', getLocale())
    }
  },

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Fitness Tracker',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  component: RootApp,
  shellComponent: RootDocument,
})

function LastVisitedRouteHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isInitialized, setIsInitialized] = useState(false)
  const hasRestoredRef = useRef(false)
  const restoreTargetRef = useRef<string | null>(null)

  useEffect(() => {
    if (hasRestoredRef.current) {
      return
    }

    const savedPath = getFromStorage<string>(
      STORAGE_KEYS.LAST_VISITED_PATH,
      '/',
    )

    if (
      location.pathname === '/' &&
      savedPath &&
      savedPath !== '/' &&
      isRestorableRoute(savedPath)
    ) {
      restoreTargetRef.current = savedPath
      navigate(savedPath, { replace: true })
    }

    hasRestoredRef.current = true
    setIsInitialized(true)
  }, [location.pathname, navigate])

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!isRestorableRoute(location.pathname)) {
      return
    }

    if (
      restoreTargetRef.current &&
      location.pathname !== restoreTargetRef.current
    ) {
      return
    }

    saveToStorage(STORAGE_KEYS.LAST_VISITED_PATH, location.pathname)
    if (restoreTargetRef.current === location.pathname) {
      restoreTargetRef.current = null
    }
  }, [isInitialized, location.pathname])

  return null
}

function RootApp() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <DataProvider>
      <LastVisitedRouteHandler />
      <MainLayout>
        {hasMounted ? (
          <Outlet />
        ) : (
          <div className="container mx-auto px-4 py-12 text-center text-slate-500">
            Loading...
          </div>
        )}
      </MainLayout>
    </DataProvider>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
