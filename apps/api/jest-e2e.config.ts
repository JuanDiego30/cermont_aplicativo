import type { Config } from 'jest';

/**
 * Jest E2E Configuration for Cermont API
 */
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testRegex: '.e2e-spec.ts$',
    moduleFileExtensions: ['js', 'json', 'ts'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.module.ts',
        '!src/**/index.ts',
        '!src/main.ts',
    ],
    coverageDirectory: './coverage-e2e',
    verbose: true,
    testTimeout: 30000,
};

export default config;
