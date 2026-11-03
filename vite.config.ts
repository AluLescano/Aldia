/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // IPv4: on Windows "localhost" can end up IPv6-only (::1), and the phone's
    // `cap run -l --forwardPorts` tunnel (adb reverse) only reaches 127.0.0.1
    host: '127.0.0.1',
  },
  test: {
    // Pure functions only for now: plain Node, no browser needed
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
