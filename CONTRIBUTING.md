# Guía de Contribución

## Tabla de Contenidos

- [Política de Branching](#política-de-branching)
- [Convenciones de Commits](#convenciones-de-commits)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Releases y Versionado](#releases-y-versionado)

## Política de Branching

Seguimos **Git Flow** modificado:

### Ramas Principales

- **main**: Código en producción (protegida, requiere PR + revisión + CI passing)
- **develop**: Código en desarrollo (protegida, requiere PR + revisión)

### Ramas de Soporte

| Tipo    | Formato                  | Origen  | Destino        |
| ------- | ------------------------ | ------- | -------------- |
| Feature | `feature/nombre-feature` | develop | develop        |
| Fix     | `fix/nombre-bug`         | develop | develop        |
| Hotfix  | `hotfix/nombre-hotfix`   | main    | main + develop |
| Release | `release/v1.2.0`         | develop | main + develop |

```bash
# Ejemplo: crear feature
git checkout -b feature/auth-2fa develop

# Ejemplo: crear hotfix
git checkout -b hotfix/security-patch main
```

## Convenciones de Commits

Usamos **[Conventional Commits](https://www.conventionalcommits.org/)**:

### Formato

```
<tipo>[ámbito opcional]: <descripción>

[cuerpo opcional]

[nota de pie opcional]
```

### Tipos Permitidos

| Tipo       | Descripción                             |
| ---------- | --------------------------------------- |
| `feat`     | Nueva característica                    |
| `fix`      | Corrección de bug                       |
| `docs`     | Solo documentación                      |
| `style`    | Formato (no afecta código)              |
| `refactor` | Refactorización sin cambios funcionales |
| `perf`     | Mejoras de rendimiento                  |
| `test`     | Agregar o corregir tests                |
| `chore`    | Tareas de mantenimiento                 |
| `ci`       | Cambios en CI/CD                        |
| `build`    | Cambios en sistema de build             |

### Ejemplos

```bash
feat(auth): implementar autenticación 2FA con TOTP
fix(orders): corregir error 500 al cargar órdenes
docs(readme): actualizar instrucciones de instalación
```

### Breaking Changes

```bash
feat(api)!: cambiar formato de respuesta de órdenes

BREAKING CHANGE: El endpoint /api/orders ahora retorna paginación.
```

## Proceso de Pull Request

1. **Crear rama desde `develop`**
2. **Desarrollar y commitear** siguiendo convenciones
3. **Mantener rama actualizada** (`git rebase origin/develop`)
4. **Push y crear PR** llenando el template
5. **Code Review** - mínimo 1 aprobación + CI passing
6. **Merge** - Squash and Merge para features

### Checklist antes de PR

- [ ] Cobertura de tests ≥ 80%
- [ ] Sin errores de lint
- [ ] Build exitoso
- [ ] CHANGELOG actualizado (si aplica)

## Releases y Versionado

Usamos **[Semantic Versioning](https://semver.org/)**:

| Tipo  | Cuándo                                   |
| ----- | ---------------------------------------- |
| MAJOR | Cambios incompatibles (breaking changes) |
| MINOR | Nueva funcionalidad compatible           |
| PATCH | Correcciones compatibles                 |

### Proceso de Release

```bash
# 1. Crear rama de release
git checkout -b release/v1.2.0 develop

# 2. Actualizar CHANGELOG.md

# 3. Commit y push
git commit -m "chore(release): bump version to 1.2.0"

# 4. Crear PR a main y develop

# 5. Crear tag después del merge
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

## Métricas de Calidad

| Métrica               | Mínimo Requerido |
| --------------------- | ---------------- |
| Cobertura de tests    | ≥ 80%            |
| Duplicación de código | < 5%             |
| Vulnerabilidades      | 0 críticas       |
| Quality Gate          | PASSED           |
