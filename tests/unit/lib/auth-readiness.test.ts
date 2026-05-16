import { describe, expect, it } from 'vitest';

import { loadAuthReadinessConfig } from '@/lib/auth-readiness';

const VALID_BASE_ENV = {
  APP_ENV: 'local',
  AUTH_APP_URL: 'http://localhost:3000',
  AUTH_SESSION_SECRET: 'session-secret',
  AUTH_TELEGRAM_CLIENT_ID: 'telegram-client-id',
  AUTH_TELEGRAM_CLIENT_SECRET: 'telegram-client-secret',
  AUTH_TELEGRAM_ISSUER: 'https://oauth.telegram.org',
  DATABASE_URL: 'postgresql://user:pass@ep-local-123.eu-central-1.aws.neon.tech/neondb?sslmode=require',
} as const;

describe('loadAuthReadinessConfig', () => {
  it('fails with clear errors when required environment variables are missing', () => {
    expect(() => loadAuthReadinessConfig({ APP_ENV: 'local' })).toThrowError(
      [
        'Auth readiness configuration is invalid:',
        '- Missing required environment variables: AUTH_APP_URL, AUTH_SESSION_SECRET, AUTH_TELEGRAM_CLIENT_ID, AUTH_TELEGRAM_CLIENT_SECRET, AUTH_TELEGRAM_ISSUER, DATABASE_URL',
      ].join('\n'),
    );
  });

  it('rejects unsupported APP_ENV values to enforce the two-environment policy', () => {
    expect(() =>
      loadAuthReadinessConfig({
        ...VALID_BASE_ENV,
        APP_ENV: 'preview',
      }),
    ).toThrowError(
      [
        'Auth readiness configuration is invalid:',
        "- APP_ENV must be set to either 'local' or 'prod'.",
      ].join('\n'),
    );
  });

  it('requires the same auth/database contract in production mode', () => {
    expect(() =>
      loadAuthReadinessConfig({
        APP_ENV: 'prod',
      }),
    ).toThrowError(
      [
        'Auth readiness configuration is invalid:',
        '- Missing required environment variables: AUTH_APP_URL, AUTH_SESSION_SECRET, AUTH_TELEGRAM_CLIENT_ID, AUTH_TELEGRAM_CLIENT_SECRET, AUTH_TELEGRAM_ISSUER, DATABASE_URL',
      ].join('\n'),
    );
  });

  it('rejects non-production vercel deployments for v1', () => {
    expect(() =>
      loadAuthReadinessConfig({
        ...VALID_BASE_ENV,
        APP_ENV: 'prod',
        VERCEL: '1',
        VERCEL_ENV: 'preview',
      }),
    ).toThrowError(
      [
        'Auth readiness configuration is invalid:',
        "- Deployed APP_ENV=prod requires VERCEL_ENV='production'.",
      ].join('\n'),
    );
  });

  it('requires a postgres connection string for Neon readiness', () => {
    expect(() =>
      loadAuthReadinessConfig({
        ...VALID_BASE_ENV,
        DATABASE_URL: 'mysql://localhost/not-supported',
      }),
    ).toThrowError(
      [
        'Auth readiness configuration is invalid:',
        '- DATABASE_URL must use postgres/postgresql protocol for Neon.',
      ].join('\n'),
    );
  });

  it('loads and returns readiness config when contract is valid', () => {
    expect(
      loadAuthReadinessConfig({
        ...VALID_BASE_ENV,
        APP_ENV: 'prod',
        VERCEL: '1',
        VERCEL_ENV: 'production',
      }),
    ).toEqual({
      appEnv: 'prod',
      authAppUrl: 'http://localhost:3000',
      authSessionSecret: 'session-secret',
      authTelegramClientId: 'telegram-client-id',
      authTelegramClientSecret: 'telegram-client-secret',
      authTelegramIssuer: 'https://oauth.telegram.org',
      databaseUrl:
        'postgresql://user:pass@ep-local-123.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    });
  });
});
