/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONNECTION_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
