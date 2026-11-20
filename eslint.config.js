import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintReact from '@eslint-react/eslint-plugin'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'android']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      '@eslint-react': eslintReact,
    },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      semi: ['error', 'never'],
      // Every item of a list needs a `key` (the classic `react/jsx-key`, which doesn't
      // support ESLint 10 yet). Only this rule of the plugin, on purpose: turn on more one
      // at a time, after checking what they flag
      '@eslint-react/no-missing-key': 'error',
    },
  },
])
