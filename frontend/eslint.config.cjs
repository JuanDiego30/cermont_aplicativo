const { defineConfig, globalIgnores } = require('eslint/config');
const nextVitals = require('eslint-config-next/core-web-vitals');
const nextTs = require('eslint-config-next/typescript');
const nextPlugin = require('@next/eslint-plugin-next/dist/index.js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jsxA11yPlugin = require('eslint-plugin-jsx-a11y');
const importPlugin = require('eslint-plugin-import');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const nextBaseConfig = require('eslint-config-next');

const ensureArray = (item) => (Array.isArray(item) ? item : [item]);

const patchedNextBase = {
  ...nextBaseConfig,
  plugins: {
    'plugin:@next/next': nextPlugin,
    'plugin:react': reactPlugin,
    'plugin:react-hooks': reactHooksPlugin,
    'plugin:jsx-a11y': jsxA11yPlugin,
    'plugin:import': importPlugin,
  },
};

const coreWebVitalsExtends = require.resolve('eslint-config-next/index.js');

const patchedNextVitals = {
  ...nextVitals,
  extends: nextVitals.extends.filter((entry) => entry !== coreWebVitalsExtends),
  plugins: {
    'plugin:@next/next': nextPlugin,
  },
};

const patchedNextTs = {
  ...nextTs,
  plugins: {
    'plugin:@typescript-eslint': tsPlugin,
  },
};

module.exports = defineConfig([
  patchedNextBase,
  ...ensureArray(patchedNextVitals),
  ...ensureArray(patchedNextTs),
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
