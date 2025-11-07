import eslintPluginJs from '@eslint/js'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  eslintPluginJs.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs,ts,d.ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      'operator-linebreak': ['error', 'before'],
    },
  },
  prettierConfig,
]
