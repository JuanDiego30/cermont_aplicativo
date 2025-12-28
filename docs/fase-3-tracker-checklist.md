# 📊 FASE 3 - TRACKER & CHECKLIST DETALLADO
**Fecha:** 28 de Diciembre 2025  
**Versión:** 3.0 - Implementation Tracker  

---

## 🎯 ESTADO DEL PROYECTO

| Fase | Nombre | Estado | % Completo | Documentación |
|------|--------|--------|-----------|-----------------|
| 1️⃣ | Backend (PasswordService) | ✅ COMPLETADO | 100% | ✅ |
| 2️⃣ | Frontend (UI/UX) | ✅ COMPLETADO | 100% | ✅ |
| 3️⃣ | Refactor + Deps | 🟡 PLANEADO | 0% | ✅ Este documento |
| 4️⃣ | Integración API | ⏳ PENDIENTE | 0% | - |
| 5️⃣ | DevOps & Deploy | ⏳ PENDIENTE | 0% | - |

---

## 📋 FASE 3 - CHECKPOINTS DETALLADOS

### ✅ CHECKPOINT 1: DEPENDENCIAS BACKEND

**Status:** ⏳ TODO

```bash
# Verificar versiones actuales
npm ls @nestjs/common
npm ls @nestjs/core
npm ls prisma

# Actualizar
npm install @nestjs/common@^11.0.0
npm install @nestjs/core@^11.0.0
npm install @nestjs/jwt@^12.0.0
npm install @nestjs/passport@^11.0.0
npm install @prisma/client@^6.0.0
npm install prisma@^6.0.0
npm install bcryptjs@^2.4.3
npm install class-validator@^0.15.0
npm install class-transformer@^0.5.1
npm install axios@^1.7.7
npm install uuid@^10.0.0
npm install pino@^9.5.0
npm install pino-pretty@^11.0.0

# Dev
npm install -D typescript@^5.4.0
npm install -D @types/node@^22.0.0
npm install -D @typescript-eslint/eslint-plugin@^8.0.0
npm install -D @typescript-eslint/parser@^8.0.0
npm install -D eslint@^9.0.0

# Verificar
npm audit
# Resultado esperado: 0 vulnerabilities

# Compilar
npm run build
# Resultado esperado: ✅ sin errores

# Commit
git add package.json package-lock.json
git commit -m "chore: actualizar dependencias backend a Dec 2025"
```

**Checkpoints:**
- [ ] npm ls muestra versiones correctas
- [ ] npm audit = 0 vulnerabilities
- [ ] npm run build = ✅
- [ ] Commit creado

---

### ✅ CHECKPOINT 2: DEPENDENCIAS FRONTEND

**Status:** ⏳ TODO

```bash
cd apps/web

# Verificar versiones
npm ls @angular/core
npm ls tailwindcss

# Actualizar
npm install @angular/common@^19.0.0
npm install @angular/core@^19.0.0
npm install @angular/forms@^19.0.0
npm install @angular/platform-browser@^19.0.0
npm install @angular/platform-browser-dynamic@^19.0.0
npm install @angular/router@^19.0.0
npm install rxjs@^7.8.1
npm install tslib@^2.6.2
npm install zone.js@^0.15.0
npm install tailwindcss@^4.0.0
npm install autoprefixer@^10.4.16
npm install postcss@^8.4.32

# Dev
npm install -D typescript@^5.4.0
npm install -D @types/node@^22.0.0
npm install -D @angular/cli@^19.0.0

# Verificar
npm audit
# Resultado esperado: 0 vulnerabilities

# Compilar
npm run build
# Resultado esperado: ✅ sin errores

# Commit
git add package.json package-lock.json
git commit -m "chore: actualizar dependencias frontend a Dec 2025"
```

**Checkpoints:**
- [ ] Angular 19 verificado
- [ ] npm audit = 0 vulnerabilities
- [ ] npm run build = ✅
- [ ] Commit creado

---

### ✅ CHECKPOINT 3: LOGGER CENTRALIZADO

**Status:** ⏳ TODO

**Archivos a crear:**

1. `apps/api/src/lib/logger/pino-logger.service.ts` ← Copiar Solución #1
2. `apps/api/src/lib/logger/logger.module.ts` ← Copiar Solución #2

**Archivos a modificar:**

1. `apps/api/src/app.module.ts`
   ```typescript
   import { LoggerModule } from './lib/logger/logger.module';

   @Module({
     imports: [LoggerModule, ...otrosModulos],
   })
   export class AppModule {}
   ```

2. `apps/api/src/main.ts`
   ```typescript
   const app = await NestFactory.create(AppModule);
   const logger = new PinoLoggerService();
   app.useLogger(logger);
   ```

**Verificación:**
```bash
npm run build
# ✅ Sin errores
npm test
# ✅ Tests pasan
```

**Checkpoints:**
- [ ] Archivos creados
- [ ] app.module.ts importa LoggerModule
- [ ] main.ts usa PinoLoggerService
- [ ] npm run build = ✅
- [ ] Commit creado: "feat: implementar Pino logger centralizado (REGLA 6)"

---

### ✅ CHECKPOINT 4: VALIDATION PIPE GLOBAL

**Status:** ⏳ TODO

**Archivos a crear:**

1. DTOs con validaciones en cada módulo
   - `apps/api/src/modules/usuario/dto/create-usuario.dto.ts`
   - `apps/api/src/modules/usuario/dto/update-usuario.dto.ts`
   - Etc. para cada módulo

**Archivos a modificar:**

1. `apps/api/src/main.ts` ← Copiar Solución #3 completo

**Verificación:**
```bash
npm run build
# ✅ Sin errores

# Probar con data inválida en Postman
POST http://localhost:3000/usuarios
{
  "nombre": "",
  "email": "invalid",
  "password": "weak"
}
# Resultado esperado: 400 Bad Request con errores detallados
```

**Checkpoints:**
- [ ] ValidationPipe agregado en main.ts
- [ ] DTOs con decoradores de validación
- [ ] npm run build = ✅
- [ ] Testing manual exitoso
- [ ] Commit creado: "feat: agregar ValidationPipe global (REGLA 5 + 21)"

---

### ✅ CHECKPOINT 5: HTTP ERROR INTERCEPTOR

**Status:** ⏳ TODO

**Archivos a crear:**

1. `apps/web/src/app/core/interceptors/http-error.interceptor.ts` ← Copiar Solución #4

**Archivos a modificar:**

1. `apps/web/src/app/app.config.ts` ← Agregar HttpErrorInterceptor

**Verificación:**
```bash
npm run build
# ✅ Sin errores

# En navegador (Angular dev server)
# 1. Hacer request a endpoint que no existe
# 2. Resultado esperado: Toast error aparece
# 3. Verificar console: no hay errores sin manejo
```

**Checkpoints:**
- [ ] Archivo creado
- [ ] Registrado en app.config.ts
- [ ] npm run build = ✅
- [ ] Testing manual: error → toast
- [ ] Commit creado: "feat: implementar HttpErrorInterceptor frontend (REGLA 5)"

---

### ✅ CHECKPOINT 6: VALUE OBJECTS

**Status:** ⏳ TODO

**Archivos a crear:**

1. `apps/api/src/domain/value-objects/estado-orden.vo.ts` ← Copiar Solución #5
2. `apps/api/src/domain/value-objects/monto.vo.ts` ← Copiar Solución #5
3. `apps/api/src/domain/value-objects/orden-numero.vo.ts` ← Copiar Solución #5

**Testing:**
```bash
# En tests o en main.ts temporal
import { EstadoOrden } from './domain/value-objects/estado-orden.vo';
import { Monto } from './domain/value-objects/monto.vo';

// Test 1: EstadoOrden válido
const estado = EstadoOrden.create('PENDIENTE');
console.log(estado.valor); // ✅ 'PENDIENTE'

// Test 2: EstadoOrden inválido
try {
  EstadoOrden.create('INVALIDO');
  console.error('❌ Debería haber lanzado error');
} catch (e) {
  console.log('✅ Error lanzado correctamente');
}

// Test 3: Monto válido
const monto = Monto.create(100.50);
console.log(monto.getValue()); // ✅ 100.50

// Test 4: Monto inválido
try {
  Monto.create(-100);
  console.error('❌ Debería haber lanzado error');
} catch (e) {
  console.log('✅ Error lanzado correctamente');
}
```

**Checkpoints:**
- [ ] 3 archivos creados
- [ ] Cada VO valida inputs correctamente
- [ ] npm run build = ✅
- [ ] Tests manuales exitosos
- [ ] Commit creado: "feat: crear Value Objects"

---

### ✅ CHECKPOINT 7: MAPPERS

**Status:** ⏳ TODO

**Archivos a crear:**

1. `apps/api/src/infrastructure/mappers/orden.mapper.ts` ← Copiar Solución #6
2. `apps/api/src/infrastructure/mappers/usuario.mapper.ts` ← Adaptar de orden.mapper
3. `apps/api/src/infrastructure/mappers/tecnico.mapper.ts` ← Adaptar de orden.mapper

**Testing:**
```bash
# En OrdenesService, usar mapper
const dto = OrdenMapper.toDTO(orden);
console.log(dto); // ✅ Datos formateados para API

// Verificar que no expone datos internos
// - Sin contraseñas
// - Sin tokens
// - Solo campos necesarios
```

**Checkpoints:**
- [ ] 3 mappers creados
- [ ] Cada uno tiene: toDTO(), toDomain(), fromDatabase(), toPersistence()
- [ ] npm run build = ✅
- [ ] Verificar que no expone datos sensibles
- [ ] Commit creado: "feat: crear Mappers (REGLA 4 - DRY)"

---

### ✅ CHECKPOINT 8: REFACTOR BASE SERVICE

**Status:** ⏳ TODO

**Archivos a modificar:**

1. `apps/api/src/lib/base/base.service.ts` ← Copiar Solución #7

**Verificar que todos los servicios heredan:**

```typescript
// ❌ Antes
@Injectable()
export class UsuarioService {
  constructor(private repo: UsuarioRepository) {}
  async getAll() { ... }
  async getOne(id) { ... }
}

// ✅ Después
@Injectable()
export class UsuarioService extends BaseService<Usuario> {
  protected readonly serviceName = 'UsuarioService';
  
  constructor(
    repo: UsuarioRepository,
    logger: PinoLoggerService,
  ) {
    super(repo, logger);
  }
  
  // Solo agregar métodos específicos
  async cambiarRol(id: string, nuevoRol: string) {
    // ...
  }
}
```

**Validación:**
```bash
npm run build
npm test

# Verificar en logs que usa logger centralizado
# Verificar que no hay console.log
grep -r "console.log" apps/api/src/
# Resultado esperado: vacío o solo en tests
```

**Checkpoints:**
- [ ] BaseService actualizado
- [ ] Todos los servicios principales heredan
- [ ] npm run build = ✅
- [ ] npm test = ✅
- [ ] No hay console.log en código
- [ ] Commit creado: "refactor: dividir funciones >30 líneas (REGLA 8)"

---

### ✅ CHECKPOINT 9: TESTS UNITARIOS

**Status:** ⏳ TODO

**Archivos a crear:**

1. `apps/api/src/lib/services/password.service.spec.ts` ← Copiar Solución #8
2. `apps/api/src/modules/auth/auth.service.spec.ts` ← Copiar Solución #8
3. `apps/api/src/modules/usuario/usuario.service.spec.ts` ← Adaptar
4. `apps/api/src/modules/ordenes/ordenes.service.spec.ts` ← Adaptar
5. Y más según sea necesario

**Ejecución:**
```bash
npm test

# Resultado esperado:
# ✅ All tests passed
# ✅ Coverage >70%

# Ver reporte de coverage
npm test -- --coverage
```

**Checkpoints:**
- [ ] 5+ archivos .spec.ts creados
- [ ] npm test = ✅
- [ ] Coverage >70%
- [ ] Commit creado: "test: agregar tests unitarios >70% coverage"

---

### ✅ CHECKPOINT 10: ELIMINAR N+1 QUERIES

**Status:** ⏳ TODO

**Archivos a modificar:**

Todos los `*.repository.ts`:

```typescript
// ❌ Antes (N+1 problem)
async findMany(skip = 0, take = 50) {
  return this.prisma.orden.findMany({ skip, take });
}

// ✅ Después (1 query con includes)
async findMany(skip = 0, take = 50) {
  return this.prisma.orden.findMany({
    skip,
    take,
    include: {
      cliente: true,
      items: true,
      pagos: true,
      tecnico: true,
      evidencias: true,
    }
  });
}
```

**Validación:**
```bash
# Con query logging en Prisma
# Verificar que solo hay 1 query en logs
# No debería haber: SELECT cliente FROM cliente WHERE id = ?
```

**Checkpoints:**
- [ ] Todos los repositorios tienen includes
- [ ] npm run build = ✅
- [ ] Verificar en logs: 1 query en lugar de N+1
- [ ] Performance mejorado (medir con Postman)
- [ ] Commit creado: "fix: eliminar N+1 queries, agregar includes (REGLA 10)"

---

## 🎯 RESUMEN DE CHECKLIST

### Pre-Implementación
- [ ] Leer `fase-3-refactor-completo.md`
- [ ] Leer `fase-3-codigo-completo.md`
- [ ] Tener GEMINI RULES v2.1 a mano
- [ ] Git limpio (`git status`)
- [ ] Backup de código importante

### Implementación
- [ ] ✅ Checkpoint 1: Deps Backend
- [ ] ✅ Checkpoint 2: Deps Frontend
- [ ] ✅ Checkpoint 3: Logger Centralizado
- [ ] ✅ Checkpoint 4: ValidationPipe Global
- [ ] ✅ Checkpoint 5: HttpErrorInterceptor
- [ ] ✅ Checkpoint 6: Value Objects
- [ ] ✅ Checkpoint 7: Mappers
- [ ] ✅ Checkpoint 8: BaseService
- [ ] ✅ Checkpoint 9: Tests Unitarios
- [ ] ✅ Checkpoint 10: N+1 Queries

### Post-Implementación
- [ ] npm run build = ✅
- [ ] npm test = ✅ (>70% coverage)
- [ ] npm run lint = ✅
- [ ] npm audit = 0 vulnerabilities
- [ ] 10 commits atómicos creados
- [ ] Todos los commits pusheados a main
- [ ] Verificación local exitosa
- [ ] Documentación actualizada

---

## 📊 MÉTRICAS ESPERADAS

### Antes
```
Vulnerabilidades: 7
Tests: 0%
Código duplicado: 15%
Funciones >30 líneas: 12
N+1 queries: 8
Mantenibilidad: Baja
```

### Después
```
Vulnerabilidades: 0 ✅
Tests: >70% ✅
Código duplicado: <3% ✅
Funciones >30 líneas: 0 ✅
N+1 queries: 0 ✅
Mantenibilidad: Alta ✅
```

---

## 🚨 TROUBLESHOOTING

### Problema: npm audit falla
**Solución:** Ejecutar `npm audit fix` o actualizar paquete específico

### Problema: npm run build falla con errores de TypeScript
**Solución:** Revisar imports, asegurarse que Value Objects estén bien importados

### Problema: Tests no compilan
**Solución:** Verificar que @nestjs/testing esté instalado

### Problema: Logger no aparece en consola
**Solución:** Revisar que main.ts tenga `app.useLogger(logger)`

### Problema: Validations no funcionan
**Solución:** Revisar que ValidationPipe esté en main.ts con configuración correcta

---

## 📞 PRÓXIMO PASO

Una vez completado este checklist:

1. Verificar que todos los checkpoints estén ✅
2. Hacer último commit: "chore: fase 3 completada - refactor y security"
3. Pasar a FASE 4: Integración Backend-Frontend

---

**Tracking ID:** PHASE-3-2025-12-28  
**Última actualización:** 28 de Diciembre 2025, 20:45 UTC  
**Estado:** 🟡 LISTO PARA COMENZAR  
**Próximo Milestone:** Todos los checkpoints completados  
