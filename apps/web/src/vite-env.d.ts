/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_DEPLOYMENT_RUN_NUMBER?: string
  readonly VITE_DEPLOYMENT_SHORT_SHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
