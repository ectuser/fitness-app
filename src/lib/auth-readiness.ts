const REQUIRED_AUTH_ENV_VARS = [
  'AUTH_APP_URL',
  'AUTH_SESSION_SECRET',
  'AUTH_TELEGRAM_CLIENT_ID',
  'AUTH_TELEGRAM_CLIENT_SECRET',
  'AUTH_TELEGRAM_ISSUER',
  'DATABASE_URL',
] as const;

type AppEnvironment = 'local' | 'prod';

type EnvMap = Record<string, string | undefined>;

export interface AuthReadinessConfig {
  appEnv: AppEnvironment;
  authAppUrl: string;
  authSessionSecret: string;
  authTelegramClientId: string;
  authTelegramClientSecret: string;
  authTelegramIssuer: string;
  databaseUrl: string;
}

export function loadAuthReadinessConfig(env: EnvMap = process.env): AuthReadinessConfig {
  const appEnvCandidate = env.APP_ENV;
  const missingVariables = REQUIRED_AUTH_ENV_VARS.filter((envVarName) => !env[envVarName]);

  const validationErrors: string[] = [];

  if (!appEnvCandidate || (appEnvCandidate !== 'local' && appEnvCandidate !== 'prod')) {
    validationErrors.push("APP_ENV must be set to either 'local' or 'prod'.");
  }

  if (missingVariables.length > 0) {
    validationErrors.push(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    );
  }

  if (env.DATABASE_URL && !/^postgres(ql)?:\/\//.test(env.DATABASE_URL)) {
    validationErrors.push('DATABASE_URL must use postgres/postgresql protocol for Neon.');
  }

  if (appEnvCandidate === 'prod' && env.VERCEL === '1' && env.VERCEL_ENV !== 'production') {
    validationErrors.push("Deployed APP_ENV=prod requires VERCEL_ENV='production'.");
  }

  if (validationErrors.length > 0) {
    throw new Error(`Auth readiness configuration is invalid:\n- ${validationErrors.join('\n- ')}`);
  }

  const appEnv = appEnvCandidate as AppEnvironment;

  return {
    appEnv,
    authAppUrl: env.AUTH_APP_URL!,
    authSessionSecret: env.AUTH_SESSION_SECRET!,
    authTelegramClientId: env.AUTH_TELEGRAM_CLIENT_ID!,
    authTelegramClientSecret: env.AUTH_TELEGRAM_CLIENT_SECRET!,
    authTelegramIssuer: env.AUTH_TELEGRAM_ISSUER!,
    databaseUrl: env.DATABASE_URL!,
  };
}
