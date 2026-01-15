---
name: git-workflow
description: Experto en Git workflow y branching strategies. Usar para conventional commits, gitflow, trunk-based development, resolución de conflictos y automatización.
triggers:
  - git
  - commit
  - branch
  - merge
  - rebase
  - conflict
  - workflow
  - conventional commits
role: specialist
scope: version-control
output-format: code
---

# Git Workflow Expert

Especialista en flujos de trabajo Git para equipos de desarrollo.

## Rol

Ingeniero de software con 8+ años de experiencia en control de versiones. Experto en Git, branching strategies, conventional commits y automatización de releases.

## Cuándo Usar Este Skill

- Configurar branching strategy
- Implementar conventional commits
- Resolver conflictos de merge
- Configurar hooks de Git
- Automatizar releases
- Gestionar tags y versiones
- Rebase interactivo
- Cherry-pick y bisect

## Branching Strategy

### GitFlow

```
main (producción)
├── develop (desarrollo)
│   ├── feature/add-user-auth
│   ├── feature/dashboard-reports
│   └── feature/api-v2
├── release/v1.2.0
├── hotfix/critical-bug
```

### Trunk-Based Development (Recomendado para CI/CD)

```
main (trunk)
├── feature/short-lived-branch-1 (máximo 2 días)
├── feature/short-lived-branch-2
└── release/v1.2.0 (solo si necesario)
```

## Conventional Commits

### Formato

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos Permitidos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add JWT refresh token` |
| `fix` | Corrección de bug | `fix(api): handle null user response` |
| `docs` | Documentación | `docs(readme): update installation` |
| `style` | Formateo (no código) | `style(lint): apply prettier` |
| `refactor` | Refactoring | `refactor(users): extract validation` |
| `perf` | Mejora de performance | `perf(query): add database index` |
| `test` | Tests | `test(auth): add login unit tests` |
| `build` | Build system | `build(deps): upgrade angular to 20` |
| `ci` | CI/CD | `ci(actions): add cache step` |
| `chore` | Mantenimiento | `chore: update .gitignore` |
| `revert` | Revert commit | `revert: feat(auth): add oauth` |

### Scopes del Proyecto

```
# Backend
backend, api, auth, prisma, users, orders, products

# Frontend
frontend, components, services, store, routing

# DevOps
ci, docker, deps, config

# General
docs, tests
```

### Ejemplos Completos

```bash
# Feature simple
git commit -m "feat(auth): implement password reset flow"

# Fix con issue reference
git commit -m "fix(orders): resolve race condition on concurrent updates

The order status was being overwritten when multiple users
updated the same order simultaneously.

Fixes #142"

# Breaking change
git commit -m "feat(api)!: change response format for pagination

BREAKING CHANGE: The pagination response now uses 'items' instead
of 'data' and includes 'meta' object with total count.

Migration guide:
- Update frontend to read from 'items' array
- Use 'meta.total' for pagination count"

# Con co-authors
git commit -m "feat(dashboard): add real-time notifications

Co-authored-by: Jane Doe <jane@example.com>
Co-authored-by: John Smith <john@example.com>"
```

## Configuración de Hooks

### .husky/pre-commit

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint staged files
pnpm lint-staged

# Run typecheck
pnpm turbo typecheck
```

### .husky/commit-msg

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message
pnpm commitlint --edit $1
```

### .husky/pre-push

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run tests before push
pnpm turbo test

# Check for secrets
pnpm secretlint "**/*"
```

### commitlint.config.js

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', 'fix', 'docs', 'style', 'refactor',
        'perf', 'test', 'build', 'ci', 'chore', 'revert',
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'backend', 'frontend', 'api', 'auth', 'prisma',
        'users', 'orders', 'products', 'components',
        'services', 'store', 'routing', 'ci', 'docker',
        'deps', 'config', 'docs', 'tests',
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
  },
};
```

## Operaciones Comunes

### Rebase Interactivo

```bash
# Rebase últimos 5 commits
git rebase -i HEAD~5

# Opciones en el editor:
# pick   = usar commit
# reword = cambiar mensaje
# edit   = pausar para modificar
# squash = combinar con anterior (mantiene mensaje)
# fixup  = combinar con anterior (descarta mensaje)
# drop   = eliminar commit
```

### Cherry-pick

```bash
# Aplicar commit específico
git cherry-pick abc123

# Aplicar rango de commits
git cherry-pick abc123..def456

# Sin commit automático
git cherry-pick -n abc123
```

### Resolución de Conflictos

```bash
# Ver archivos en conflicto
git status

# Marcar archivo como resuelto
git add <file>

# Continuar después de resolver
git rebase --continue
# O
git merge --continue

# Abortar operación
git rebase --abort
git merge --abort

# Usar versión específica
git checkout --ours <file>    # Nuestra versión
git checkout --theirs <file>  # Versión de ellos
```

### Bisect (encontrar bug)

```bash
# Iniciar bisect
git bisect start

# Marcar commit malo (actual)
git bisect bad

# Marcar commit bueno (anterior)
git bisect good v1.0.0

# Git checkout automático, probar y marcar:
git bisect good  # O
git bisect bad

# Cuando encuentre el commit problemático:
git bisect reset
```

### Stash

```bash
# Guardar cambios
git stash push -m "Work in progress on feature X"

# Listar stashes
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{2}

# Crear branch desde stash
git stash branch feature/from-stash
```

## Aliases Recomendados

```bash
# ~/.gitconfig
[alias]
  # Status corto
  s = status -sb
  
  # Log bonito
  lg = log --oneline --graph --decorate --all
  
  # Último commit
  last = log -1 HEAD --stat
  
  # Commits de hoy
  today = log --since=midnight --oneline --author='$(git config user.email)'
  
  # Branches ordenados por fecha
  recent = branch --sort=-committerdate --format='%(committerdate:relative)%09%(refname:short)'
  
  # Deshacer último commit (mantiene cambios)
  undo = reset --soft HEAD~1
  
  # Amendear sin cambiar mensaje
  amend = commit --amend --no-edit
  
  # Limpiar branches mergeados
  cleanup = "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
  
  # Push forzado seguro
  pushf = push --force-with-lease
  
  # Diff con estadísticas
  diffs = diff --stat

[pull]
  rebase = true

[push]
  default = current
  autoSetupRemote = true

[rebase]
  autoSquash = true
  autoStash = true

[merge]
  conflictStyle = diff3
```

## Release Workflow

### Semantic Versioning

```bash
# MAJOR.MINOR.PATCH
# 1.0.0 -> 1.0.1 (patch: fix bug)
# 1.0.0 -> 1.1.0 (minor: new feature)
# 1.0.0 -> 2.0.0 (major: breaking change)
```

### Automatizar con standard-version

```bash
# package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major",
    "release:patch": "standard-version --release-as patch"
  }
}

# Ejecutar release
pnpm release

# Genera:
# - Actualiza CHANGELOG.md
# - Bump versión en package.json
# - Crea commit y tag
```

### .versionrc.json

```json
{
  "types": [
    {"type": "feat", "section": "Features"},
    {"type": "fix", "section": "Bug Fixes"},
    {"type": "perf", "section": "Performance"},
    {"type": "refactor", "section": "Code Refactoring"},
    {"type": "docs", "section": "Documentation"},
    {"type": "chore", "hidden": true},
    {"type": "style", "hidden": true},
    {"type": "test", "hidden": true},
    {"type": "build", "hidden": true},
    {"type": "ci", "hidden": true}
  ],
  "commitUrlFormat": "https://github.com/owner/repo/commit/{{hash}}",
  "compareUrlFormat": "https://github.com/owner/repo/compare/{{previousTag}}...{{currentTag}}"
}
```

## Restricciones

### DEBE HACER
- Usar conventional commits
- Mantener commits atómicos
- Escribir mensajes descriptivos
- Hacer rebase antes de merge
- Usar feature branches cortos

### NO DEBE HACER
- Force push a main/develop
- Commits con "WIP" o "fix"
- Mezclar cambios no relacionados
- Ignorar conflictos
- Commits con secrets/credenciales

## Skills Relacionados

- **github-actions-cicd** - Automatización de releases
- **eslint-prettier** - Hooks de pre-commit
- **monorepo-management** - Branches por package
