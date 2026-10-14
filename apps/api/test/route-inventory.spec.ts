import { DiscoveryService, Reflector } from '@nestjs/core'
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants'
import { RequestMethod } from '@nestjs/common'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { IS_PUBLIC } from '../src/auth/public.decorator'
import { startApp } from './test-app'
import type { TestApp } from './test-app'

type Route = { method: string; path: string; isPublic: boolean }

// Routes that may skip authentication. Better Auth's own /api/auth/* is mounted
// outside Nest, so it never appears in the Nest route table.
const PUBLIC_ALLOWLIST = ['GET /health']

function joinPath(...parts: Array<string>) {
  return (
    '/' +
    parts
      .map((part) => part.replace(/^\/|\/$/g, ''))
      .filter(Boolean)
      .join('/')
  )
}

function listRoutes(ctx: TestApp): Array<Route> {
  const discovery = ctx.app.get(DiscoveryService)
  const reflector = ctx.app.get(Reflector)
  const routes: Array<Route> = []
  for (const wrapper of discovery.getControllers()) {
    const { instance, metatype } = wrapper
    if (!instance || !metatype) continue
    const prefix = String(Reflect.getMetadata(PATH_METADATA, metatype) ?? '')
    const prototype = Object.getPrototypeOf(instance) as Record<string, unknown>
    for (const name of Object.getOwnPropertyNames(prototype)) {
      const handler = prototype[name]
      if (typeof handler !== 'function') continue
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as
        | RequestMethod
        | undefined
      if (method === undefined) continue
      const path = String(Reflect.getMetadata(PATH_METADATA, handler) ?? '')
      routes.push({
        method: RequestMethod[method],
        path: joinPath(prefix, path),
        isPublic: Boolean(
          reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC, [
            handler as () => void,
            metatype,
          ]),
        ),
      })
    }
  }
  return routes
}

describe('route inventory', () => {
  let ctx: TestApp

  beforeAll(async () => {
    ctx = await startApp()
  })

  afterAll(async () => {
    await ctx.app.close()
  })

  it('finds the routes it is meant to inspect', () => {
    const labels = listRoutes(ctx).map((r) => `${r.method} ${r.path}`)

    expect(labels).toContain('GET /health')
    expect(labels).toContain('GET /api/v1/me')
  })

  it('has no public route outside the allowlist', () => {
    const publicRoutes = listRoutes(ctx)
      .filter((route) => route.isPublic)
      .map((route) => `${route.method} ${route.path}`)

    expect(publicRoutes.sort()).toEqual([...PUBLIC_ALLOWLIST].sort())
  })

  it('answers 401 to an anonymous request on every non-public route', async () => {
    const protectedRoutes = listRoutes(ctx).filter((route) => !route.isPublic)
    expect(protectedRoutes.length).toBeGreaterThan(0)

    for (const route of protectedRoutes) {
      const path = route.path.replace(/:[^/]+/g, 'x')
      const response = await request(ctx.app.getHttpServer())
        [route.method.toLowerCase() as 'get'](path)
        .send(route.method === 'GET' ? undefined : {})
      expect(response.status, `${route.method} ${route.path}`).toBe(401)
    }
  })
})
