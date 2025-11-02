module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 30000,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(jsdom|parse5|dompurify)/)'],
  // Only run tests placed explicitly under the repository `tests/` folder to avoid duplicate/legacy suites
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js', '<rootDir>/src/tests/**/*.test.js', '<rootDir>/src/tests/**/*.spec.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/tests/**', '!**/node_modules/**'],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
};
