module.exports = [
  {
    // Basic ignore for node_modules and build folders
    ignores: ['node_modules/**', '.next/**', 'out/**'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Use core rule for unused vars; allow underscore-only parameters
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
