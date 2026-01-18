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
        NodeJS: 'readonly',
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
    files: ['**/*.spec.ts', '**/*.test.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: [
      'src/modules/admin/**/*.ts',
      'src/modules/administrative-closure/**/*.ts',
      'src/modules/alerts/**/*.ts',
      'src/modules/auth/**/*.ts',
      'src/modules/costs/**/*.ts',
      'src/modules/dashboard/**/*.ts',
      'src/modules/evidence/**/*.ts',
      'src/modules/execution/**/*.ts',
      'src/modules/forms/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-case-declarations': 'warn',
      'no-undef': 'off',
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
