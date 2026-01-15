import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: ['.eslintrc.js', 'dist/**', 'node_modules/**', 'prisma/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['src/modules/**/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'warn',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@prisma/*', '@prisma/client', 'prisma', 'express'],
              message:
                'Domain debe ser puro: no importes NestJS/Prisma/Express desde domain/**. Usa puertos (interfaces) y adapters en infrastructure/**.',
            },
          ],
        },
      ],
    },
  },
];
