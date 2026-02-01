/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_N8N_API_KEY: string;
  readonly VITE_N8N_BASE_URL: string;
  readonly VITE_N8N_WEBHOOK_URL: string;
  readonly VITE_USE_N8N: string; // 'true' or 'false' - default to true if not set
  readonly VITE_BACKEND_URL: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
