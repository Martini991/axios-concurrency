import eslintPluginJs from '@eslint/js'
import globals from 'globals'
import prettierConfig from 'eslint-config-prettier'

export default [
  eslintPluginJs.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'operator-linebreak': ['error', 'before'],
    },
  },
  prettierConfig,
]
