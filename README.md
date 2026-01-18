# CERMONT - Sistema de Gestión de Órdenes de Servicio

[![CI](https://github.com/JuanDiego30/cermont_aplicativo/actions/workflows/ci.yml/badge.svg)](https://github.com/JuanDiego30/cermont_aplicativo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-blueviolet)](https://turbo.build/repo)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red)](https://nestjs.com/)
[![Angular](https://img.shields.io/badge/Angular-21.x-red)](https://angular.io/)

Sistema integral para la gestión de órdenes de servicio, técnicos y mantenimiento. Monorepo con pnpm + Turborepo.

## Inicio Rápido

```bash
# Instalar dependencias
pnpm install

# Desarrollo (paralelo)
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Formato
pnpm format
```

## Estructura del Proyecto

```
├── frontend/          # Angular 21 (@cermont/frontend)
├── backend/           # NestJS 11 API (@cermont/backend)
├── packages/          # Paquetes compartidos
│   └── shared-types/  # Tipos TypeScript compartidos
├── turbo.json         # Configuración de Turborepo
└── package.json       # Scripts root
```

## Scripts Disponibles

| Comando          | Descripción                     |
| ---------------- | ------------------------------- |
| `pnpm dev`       | Inicia ambas apps en modo watch |
| `pnpm build`     | Compila todos los paquetes      |
| `pnpm test`      | Ejecuta todos los tests         |
| `pnpm lint`      | Lint de todos los paquetes      |
| `pnpm lint:fix`  | Lint con auto-fix               |
| `pnpm typecheck` | Verificación de tipos           |
| `pnpm format`    | Formatea todos los archivos     |
| `pnpm clean`     | Elimina artefactos de build     |
| `pnpm audit`     | Auditoría de calidad            |

## Documentación

- [Guía de Contribución](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Licencia

[MIT](LICENSE) © 2026 CERMONT S.A.S.
