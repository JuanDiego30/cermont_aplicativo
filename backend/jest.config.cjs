const { defaultsESM } = require('ts-jest/presets');
const path = require('node:path');

module.exports = {
  ...defaultsESM,
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  testTimeout: 30000, // 30 segundos de timeout por defecto
  forceExit: true, // Forzar salida después de tests
  detectOpenHandles: false, // Desactivar detección de handles abiertos
  testMatch: [
    '**/src/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@backend/(.*)$': '<rootDir>/src/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infra/(.*)$': '<rootDir>/src/infra/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      useESM: true,
      isolatedModules: true
    }]
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/server.ts'
  ]
};
