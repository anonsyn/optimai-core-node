interface ImportMetaEnv {
  readonly VITE_TELEGRAM_CLIENT_SECRET: string
  readonly VITE_CLIENT_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
