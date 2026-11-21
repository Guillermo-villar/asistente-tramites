import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { chatApi } from './server/chat.ts'

export default defineConfig(({ mode }) => ({
  // 127.0.0.1 only: /api/extension spends the OpenAI key in web/.env.local, so it must not be reachable
  // from the network. The extension calls it at this exact address (src/agent/localClient.ts).
  server: {
    host: '127.0.0.1', port: 5173, strictPort: true,
    cors: { origin: [/^chrome-extension:\/\/[a-p]{32}$/, /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/] },
    // The web reads the extension's site maps from ../plugins (one source of truth).
    fs: { allow: ['..'] },
  },
  plugins: [react(), tailwindcss(), chatApi({ ...loadEnv(mode, import.meta.dirname, ''), ...process.env }, path.resolve(import.meta.dirname, '../plugins'))],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },
}))
