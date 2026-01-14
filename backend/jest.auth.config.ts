import type { Config } from 'jest';

import baseConfig from './jest.config.ts';

// Cobertura enfocada al scope del prompt de Auth.
// RootDir del config base es `src`, por lo que los paths son relativos a `src/`.
const config: Config = {
  ...baseConfig,
  collectCoverageFrom: [
    'modules/auth/auth.service.ts',
    'modules/auth/application/use-cases/login.use-case.ts',
    'modules/auth/application/use-cases/refresh-token.use-case.ts',
    'modules/auth/guards/**/*.ts',
    'modules/auth/domain/value-objects/**/*.ts',
    '!**/*.module.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};

export default config;
