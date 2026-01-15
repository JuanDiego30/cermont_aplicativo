---
name: eslint-prettier
description: Experto en ESLint y Prettier para TypeScript, Angular y NestJS. Usar para configuración de linting, formateo, reglas personalizadas y automatización.
triggers:
  - ESLint
  - Prettier
  - linting
  - formatting
  - code style
  - rules
  - husky
  - lint-staged
role: specialist
scope: configuration
output-format: code
---

# ESLint + Prettier Configuration

Especialista en configuración de linting y formateo para proyectos TypeScript.

## Rol

Ingeniero de calidad de código con 6+ años de experiencia. Experto en ESLint, Prettier, TypeScript y automatización de calidad de código.

## Cuándo Usar Este Skill

- Configurar ESLint para TypeScript/Angular/NestJS
- Configurar Prettier
- Resolver conflictos ESLint/Prettier
- Crear reglas personalizadas
- Automatizar con husky/lint-staged
- Migrar a ESLint flat config
- Optimizar performance de linting

## ESLint Flat Config (v9+)

### Backend NestJS

```javascript
// backend/eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
  
  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  
  // TypeScript specific
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  // NestJS specific rules
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      
      // NestJS patterns
      '@typescript-eslint/no-extraneous-class': 'off', // Controllers/Modules are classes
      '@typescript-eslint/require-await': 'off', // Decorators may not need await
      
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-duplicate-imports': 'error',
    },
  },
  
  // Test files
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  
  // Prettier last
  prettier,
);
```

### Frontend Angular

```javascript
// frontend/eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Ignores
  {
    ignores: [
      'dist/**',
      '.angular/**',
      'node_modules/**',
      'coverage/**',
    ],
  },
  
  // TypeScript files
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Angular
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'error',
      
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      
      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  
  // HTML templates
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  },
  
  // Prettier last
  prettier,
);
```

### Monorepo Root

```javascript
// eslint.config.mjs (root)
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  // Ignores globales
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      '**/pnpm-lock.yaml',
    ],
  },
  
  // Configuración base para archivos raíz
  {
    files: ['*.js', '*.mjs', '*.cjs'],
    ...eslint.configs.recommended,
    rules: {
      'no-console': 'off',
    },
  },
  
  prettier,
];
```

## Prettier

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "printWidth": 120,
        "parser": "angular"
      }
    },
    {
      "files": ["*.json", "*.jsonc"],
      "options": {
        "tabWidth": 2
      }
    },
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve"
      }
    }
  ]
}
```

### .prettierignore

```
# Build outputs
dist/
build/
.angular/
coverage/

# Dependencies
node_modules/
pnpm-lock.yaml

# Generated
*.min.js
*.min.css

# Prisma
prisma/migrations/

# Other
.git/
.turbo/
```

## Automatización

### Husky + lint-staged

```bash
# Instalar
pnpm add -D -w husky lint-staged
pnpm exec husky init
```

```json
// package.json (root)
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,mjs}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{html,css,scss,json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
pnpm lint-staged
```

```bash
# .husky/commit-msg
pnpm exec commitlint --edit $1
```

### Commitlint

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Documentación
        'style',    // Formateo, sin cambios de código
        'refactor', // Refactoring
        'perf',     // Mejora de performance
        'test',     // Tests
        'build',    // Build, CI, deps
        'ci',       // CI específico
        'chore',    // Mantenimiento
        'revert',   // Revert commit
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'backend',
        'frontend',
        'shared',
        'deps',
        'config',
        'ci',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};
```

## Scripts de package.json

```json
{
  "scripts": {
    "lint": "eslint . --cache",
    "lint:fix": "eslint . --fix --cache",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "quality": "pnpm lint && pnpm format:check && pnpm typecheck"
  }
}
```

## VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "html"
  ],
  "eslint.useFlatConfig": true,
  "eslint.workingDirectories": [
    { "directory": "backend", "changeProcessCWD": true },
    { "directory": "frontend", "changeProcessCWD": true }
  ]
}
```

## Reglas Personalizadas

### Plugin Personalizado

```javascript
// eslint-plugins/no-console-in-services.js
export default {
  rules: {
    'no-console-in-services': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow console.log in service files',
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        const filename = context.getFilename();
        if (!filename.includes('.service.ts')) {
          return {};
        }
        
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'console'
            ) {
              context.report({
                node,
                message: 'Use Logger instead of console in services',
              });
            }
          },
        };
      },
    },
  },
};
```

## Restricciones

### DEBE HACER
- Usar ESLint flat config (v9+)
- Configurar Prettier como última extensión
- Usar husky para hooks de git
- Cachear linting en CI
- Configurar VS Code para format on save

### NO DEBE HACER
- Usar .eslintrc (deprecated)
- Mezclar formateo de ESLint con Prettier
- Deshabilitar reglas sin justificación
- Ignorar errores de TypeScript
- Commit sin pasar lint-staged

## Skills Relacionados

- **clean-architecture** - Patrones de código
- **jest-testing** - Testing standards
- **github-actions-cicd** - CI quality gates
