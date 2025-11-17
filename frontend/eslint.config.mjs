import eslintConfigPrettier from 'eslint-config-prettier';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**']
  },
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off'
    }
  }
];

export default config;
