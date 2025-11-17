import eslintConfigPrettier from 'eslint-config-prettier';

const config = [
  {
    ignores: ['.next/**', 'dist/**', 'node_modules/**']
  },
  eslintConfigPrettier,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off'
    }
  }
];

export default config;
