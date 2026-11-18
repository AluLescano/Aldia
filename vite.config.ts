/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The app version lives only in package.json (Android reads it from there too)
const packageJsonPath = path.resolve(import.meta.dirname, 'package.json')
const { version } = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  version: string
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite swaps every __APP_VERSION__ in the app's code for "0.4.0" when it builds
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
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
