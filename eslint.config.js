//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import vitest from '@vitest/eslint-plugin'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import playwright from 'eslint-plugin-playwright'
import reactHooks from 'eslint-plugin-react-hooks'
import testingLibrary from 'eslint-plugin-testing-library'

const rawColorUtility =
  /\b(?:bg|text|border|ring|shadow)-(?:white|black|slate|gray|zinc|neutral|red|green|blue|yellow|amber|orange|emerald|sky|indigo|violet|purple|pink|rose)(?:-[0-9]{2,3})?(?:\/[0-9]+)?\b/g

const intentionalOverlayUtilities = new Set(['bg-black/70', 'bg-black/80'])

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('eslint').JSSyntaxElement} node
 * @param {string} value
 */
function reportRawColorUtilities(context, node, value) {
  for (const match of value.matchAll(rawColorUtility)) {
    if (intentionalOverlayUtilities.has(match[0])) {
      continue
    }

    context.report({
      node,
      message: `Use a semantic theme utility instead of "${match[0]}".`,
    })
  }
}

const semanticThemePlugin = {
  rules: {
    'no-raw-color-utilities': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'disallow raw Tailwind palette utilities in application UI',
        },
        schema: [],
      },
      /** @param {import('eslint').Rule.RuleContext} context */
      create(context) {
        return {
          /** @param {any} node */
          Literal(node) {
            if (typeof node.value === 'string') {
              reportRawColorUtilities(context, node, node.value)
            }
          },
          /** @param {any} node */
          TemplateElement(node) {
            reportRawColorUtilities(context, node, node.value.raw)
          },
        }
      },
    },
  },
}

export default [
  ...tanstackConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    plugins: {
      'semantic-theme': semanticThemePlugin,
    },
    rules: {
      'semantic-theme/no-raw-color-utilities': 'error',
    },
  },
  ...tanstackQuery.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['src/**/*.{ts,tsx}'],
  })),
  {
    files: ['tests/unit/**/*.{ts,tsx}'],
    ...vitest.configs.recommended,
  },
  {
    files: ['tests/unit/**/*.{ts,tsx}'],
    ...testingLibrary.configs['flat/react'],
  },
  {
    files: ['tests/e2e/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    rules: {
      'import/no-cycle': 'off',
    },
  },
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/paraglide/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
]
