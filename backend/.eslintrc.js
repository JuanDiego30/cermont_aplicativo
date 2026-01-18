module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules', 'prisma'],
  overrides: [
    {
      files: ['src/modules/**/domain/**/*.ts'],
      rules: {
        // Guardrail inicial (warning) para evitar que Domain dependa del framework.
        // Se podrá subir a "error" en Fase 1/2 cuando el baseline esté limpio.
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
  ],
  rules: {},
};
