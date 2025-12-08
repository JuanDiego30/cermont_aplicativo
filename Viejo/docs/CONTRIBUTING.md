# Guía de Contribución - CERMONT

¡Gracias por tu interés en contribuir a CERMONT! Esta guía te ayudará a entender nuestro proceso de desarrollo.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Flujo de Trabajo Git](#flujo-de-trabajo-git)
4. [Estándares de Código](#estándares-de-código)
5. [Proceso de Pull Request](#proceso-de-pull-request)
6. [Reporte de Bugs](#reporte-de-bugs)
7. [Solicitud de Features](#solicitud-de-features)

## 📜 Código de Conducta

- Sé respetuoso con todos los contribuidores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Muestra empatía hacia otros miembros

## 🛠️ Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clone tu fork
git clone https://github.com/tu-usuario/cermont-app.git
cd cermont-app

# Agregar upstream
git remote add upstream https://github.com/cermont/cermont-app.git
```

### 2. Instalar Dependencias

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma generate

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
```

### 3. Iniciar Servicios

```bash
# Iniciar PostgreSQL y Redis
docker-compose up -d postgres redis

# Ejecutar migraciones
cd backend
npx prisma migrate dev

# Iniciar en modo desarrollo
npm run dev

# En otra terminal
cd frontend
npm run dev
```

## 🌿 Flujo de Trabajo Git

Seguimos **Git Flow** simplificado:

### Ramas Principales
- `main` - Código en producción
- `develop` - Integración de desarrollo

### Ramas de Trabajo
- `feature/nombre-feature` - Nuevas funcionalidades
- `bugfix/nombre-bug` - Corrección de bugs
- `hotfix/nombre-hotfix` - Fixes urgentes en producción

### Workflow

```bash
# 1. Sincronizar con upstream
git checkout develop
git pull upstream develop

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Hacer commits (ver convención abajo)
git add .
git commit -m "feat(ordenes): agregar filtro por fecha"

# 4. Push a tu fork
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request hacia develop
```

### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formateo (no afecta código)
- `refactor` - Refactorización
- `perf` - Mejora de rendimiento
- `test` - Agregar/modificar tests
- `chore` - Tareas de mantenimiento
- `ci` - Cambios en CI/CD

**Ejemplos:**
```bash
feat(auth): agregar autenticación con Google OAuth
fix(ordenes): corregir cálculo de fecha de vencimiento
docs(api): actualizar documentación de endpoints
perf(queries): optimizar consulta de órdenes con paginación
test(usuarios): agregar tests para servicio de usuarios
```

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Correcto
interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  createdAt: Date;
}

async function obtenerUsuario(id: string): Promise<Usuario> {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
  });
  
  if (!usuario) {
    throw new NotFoundError(`Usuario ${id} no encontrado`);
  }
  
  return usuario;
}

// ❌ Incorrecto
async function getUser(id: any) {
  return await prisma.usuario.findUnique({ where: { id } });
}
```

### Reglas Generales

1. **Usar TypeScript estricto** - No `any` sin justificación
2. **Nombrar en español** - Variables, funciones, clases en español
3. **Comentarios en español** - Documentación y comentarios
4. **Funciones puras** - Preferir funciones sin efectos secundarios
5. **Early returns** - Evitar anidamiento excesivo

### Backend - Estructura de Features

```typescript
// features/ordenes/ordenes.controller.ts
export class OrdenesController {
  async crear(req: Request, res: Response) {
    const dto = crearOrdenSchema.parse(req.body);
    const orden = await this.ordenesService.crear(dto, req.user.id);
    return res.status(201).json({ data: orden });
  }
}

// features/ordenes/ordenes.service.ts
export class OrdenesService {
  async crear(dto: CrearOrdenDto, usuarioId: string): Promise<Orden> {
    return this.ordenesRepository.crear({
      ...dto,
      creadoPor: usuarioId,
      estado: EstadoOrden.PENDIENTE,
    });
  }
}

// features/ordenes/ordenes.repository.ts
export class OrdenesRepository {
  async crear(data: Prisma.OrdenCreateInput): Promise<Orden> {
    return this.prisma.orden.create({ data });
  }
}
```

### Frontend - Componentes

```tsx
// ✅ Correcto - Componente con tipos
interface TarjetaOrdenProps {
  orden: Orden;
  onEditar?: (id: string) => void;
  className?: string;
}

export function TarjetaOrden({ 
  orden, 
  onEditar, 
  className 
}: TarjetaOrdenProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="font-semibold">{orden.titulo}</h3>
      <EstadoBadge estado={orden.estado} />
      {onEditar && (
        <Button onClick={() => onEditar(orden.id)}>
          Editar
        </Button>
      )}
    </div>
  );
}
```

### ESLint y Prettier

```bash
# Verificar linting
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

## 🔄 Proceso de Pull Request

### Antes de Crear PR

1. ✅ Código pasa linting (`npm run lint`)
2. ✅ Todos los tests pasan (`npm run test`)
3. ✅ No hay conflictos con `develop`
4. ✅ Commits siguen convención
5. ✅ Documentación actualizada si aplica

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Nueva funcionalidad (feature)
- [ ] Corrección de bug (bugfix)
- [ ] Refactorización
- [ ] Documentación
- [ ] Otro: ___

## Cambios Realizados
- Cambio 1
- Cambio 2
- Cambio 3

## Screenshots (si aplica)
Agregar capturas de pantalla si hay cambios visuales.

## Testing
Describir cómo se probaron los cambios.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He agregado tests para los cambios
- [ ] Documentación actualizada
- [ ] Los tests existentes pasan
```

### Revisión de Código

- Mínimo 1 aprobación requerida
- CI debe pasar (lint, tests, build)
- Sin conflictos de merge
- Comentarios resueltos

## 🐛 Reporte de Bugs

### Template de Issue - Bug

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
Qué debería pasar.

## Comportamiento Actual
Qué está pasando realmente.

## Screenshots
Si aplica, agregar capturas de pantalla.

## Entorno
- OS: [ej. Windows 11, macOS Sonoma]
- Browser: [ej. Chrome 120]
- Versión: [ej. 1.2.3]

## Contexto Adicional
Cualquier información adicional relevante.
```

## 💡 Solicitud de Features

### Template de Issue - Feature

```markdown
## Descripción de la Feature
Descripción clara de la funcionalidad solicitada.

## Problema que Resuelve
¿Qué problema o necesidad resuelve esta feature?

## Solución Propuesta
Descripción de cómo debería funcionar.

## Alternativas Consideradas
Otras soluciones que se consideraron.

## Contexto Adicional
Mockups, diagramas, o información adicional.
```

## 🏷️ Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0) - Cambios incompatibles en API
- **MINOR** (0.1.0) - Nueva funcionalidad compatible
- **PATCH** (0.0.1) - Correcciones de bugs

## 📞 Contacto

- **Slack**: #cermont-dev
- **Email**: dev@cermont.com
- **Wiki**: https://github.com/cermont/cermont-app/wiki

---

¡Gracias por contribuir a CERMONT! 🚀
