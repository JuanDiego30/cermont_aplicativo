import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!**/main.ts', '!**/index.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^uuid$': '<rootDir>/../test/mocks/uuid.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};

export default config;
