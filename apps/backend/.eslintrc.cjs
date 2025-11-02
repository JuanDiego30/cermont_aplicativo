module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  rules: {
    // Desactivar regla específica de Next.js que busca la carpeta pages
    'next/no-html-link-for-pages': 'off',
  },
};
