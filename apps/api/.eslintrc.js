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
    rules: {},
};
