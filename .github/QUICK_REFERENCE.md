# ⚡ CERMONT QUICK REFERENCE CHEATSHEET

**Respuestas rápidas a preguntas comunes de desarrollo.** Siempre abierto en una pestaña.

---

## 📍 "Necesito [ACCIÓN]" → Consulta Este Agente

| Necesito... | Agente | Archivo |
|-------------|--------|----------|
| **Agregar endpoint** | backend-[feature] | `.github/agents/backend-*.agent.md` |
| **Validar entrada** | backend-formularios | `.github/agents/backend-formularios.agent.md` |
| **Manejar errores** | backend-[feature] | "Error Handling" section |
| **Crear componente** | frontend-ui-ux | `.github/agents/frontend-ui-ux.agent.md` |
| **Consumir API** | frontend-api-integration | `.github/agents/frontend-api-integration.agent.md` |
| **Estado compartido** | frontend-state-data | `.github/agents/frontend-state-data.agent.md` |
| **Optimizar performance** | frontend-performance | `.github/agents/frontend-performance.agent.md` |
| **Escribir tests** | quality-testing | `.github/agents/quality-testing.agent.md` |
| **Desplegar** | devops-ci-cd | `.github/agents/devops-ci-cd.agent.md` |
| **Autenticación/Permisos** | backend-auth | `.github/agents/backend-auth.agent.md` |
| **Subir archivos** | backend-evidencias | `.github/agents/backend-evidencias.agent.md` |
| **Sincronizar offline** | backend-sync | `.github/agents/backend-sync.agent.md` |
| **Generar PDF** | backend-reportes-pdf | `.github/agents/backend-reportes-pdf.agent.md` |

---

## 🔧 Scripts Lámina de Referencia

### Inicio Rápido
```bash
# Setup inicial
git clone git@github.com:JuanDiego30/cermont_aplicativo.git
cd cermont_aplicativo
npm install
docker-compose -f docker-compose.dev.yml up -d

# Servidores (en 2 terminales)
npm run start:api
npm run start:web

# ✅ Abierto en http://localhost:4200
```

### Desarrollo Diario
```bash
# Tests
npm run test              # Ejecuta una vez
npm run test:watch       # Modo watch
npm run test -- --coverage  # Con cobertura

# Linting
npm run lint             # Verificar
npm run lint -- --fix    # Auto-corregir
npm run format           # Prettier (escribir)
npm run format:check     # Prettier (verificar solo)
npm run type-check       # TypeScript

# Build
npm run build            # Todo
npm run build:api        # Solo backend
npm run build:web        # Solo frontend

# BD (Prisma)
npm run migrate          # Ejecutar migrations
npm run migrate:dev      # Modo desarrollo
npm run db:reset         # ⚠️ Reset BD (solo dev)
```

### Antes de PR
```bash
# Chequeo completo
npm run lint
npm run format:check
npm run type-check
npm run test -- --coverage  # Debe ser >80%
npm run build

# Si todo está verde: listo para PR 🙋
```

---

## 🎯 Estructura de Carpetas Rápida

```
Quiero crear un...

💫 COMPONENTE REUTILIZABLE
→ apps/web/src/app/shared/components/[nombre]/

SERVICIO API (Frontend)
→ apps/web/src/app/core/services/[feature].service.ts

SERVICIO/CONTROLADOR (Backend)
→ apps/api/src/modules/[feature]/[feature].service.ts
→ apps/api/src/modules/[feature]/[feature].controller.ts

TEST
→ Mismo lugar que el código, con .spec.ts

DIRECTIVA CUSTOM
→ apps/web/src/app/shared/directives/[name].directive.ts

GUARD (Frontend)
→ apps/web/src/app/core/guards/[name].guard.ts

INTERCEPTOR
→ apps/web/src/app/core/interceptors/[name].interceptor.ts

FILTRO/MIDDLEWARE (Backend)
→ apps/api/src/common/filters/[name].filter.ts
```

---

## ✅ Checklist Antes de PR

```markdown
### Tests
- [ ] npm run test -- --coverage (>80%)
- [ ] npm run test:e2e (flujos críticos)

### Calidad
- [ ] npm run lint (sin errores)
- [ ] npm run format:check (formateado)
- [ ] npm run type-check (TypeScript OK)

### Build
- [ ] npm run build (sin errores)
- [ ] Bundle <500KB gzip (frontend)
- [ ] Lighthouse >90 (frontend)

### Documentación
- [ ] Agentes mencionados en PR description
- [ ] Código auto-documentado
- [ ] Cambios en DTOs/API documentados

### Validación Agentes
- [ ] Sigues patrón del agente
- [ ] Validaste contra checklist de agente
- [ ] No tiene límites que violes
```

---

## 📄 Patrones Clave en 30 Segundos

### Backend - Endpoint Nuevo
```typescript
// 1. Crear DTO
export class CreateOrdenDto { ... }

// 2. Validar en decorator
@IsNotEmpty()
@IsString()

// 3. Servicio
@Injectable()
export class OrdenesService {
  async create(dto: CreateOrdenDto) {
    // Lógica aquí
    this.logger.log('Orden creada');
  }
}

// 4. Controller
@Post()
@UseGuards(JwtAuthGuard)
async create(@Body() dto: CreateOrdenDto) {
  return this.service.create(dto);
}

// 5. Tests
it('should create orden', () => {
  // Test aquí
});
```

### Frontend - Nuevo Componente
```typescript
// 1. Crear en shared/components
@Component({
  selector: 'app-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...
    <button [attr.aria-label]="label">
      <ng-content></ng-content>
    </button>
  ...`,
  styles: [`...`]
})
export class ButtonComponent {
  @Input() label: string;
  @Output() clicked = new EventEmitter<void>();
}

// 2. Importar donde necesites
import { ButtonComponent } from '@shared/components/button';

// 3. Usar en template
<app-button label="Click me" (clicked)="onAction()"></app-button>

// 4. Tests
it('should emit clicked event', () => {
  component.clicked.emit();
  expect(component.clicked).toHaveBeenCalled();
});
```

### Frontend - Servicio API
```typescript
// 1. Crear en core/services
@Injectable({ providedIn: 'root' })
export class OrdenesService {
  constructor(private api: ApiService) {}

  getOrdenes(filtros: OrdenFiltros): Observable<Orden[]> {
    return this.api.get<Orden[]>('/ordenes', { params: filtros })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        catchError(err => this.errorHandler.handle(err, '/ordenes'))
      );
  }
}

// 2. Usar en componente
@Component({ ... })
export class OrdenesListComponent implements OnInit {
  ordenes$ = this.service.getOrdenes(filtros);

  constructor(private service: OrdenesService) {}
}

// 3. Template (async pipe = auto unsubscribe)
<div *ngFor="let orden of ordenes$ | async">
  {{ orden.numero }}
</div>
```

---

## 📄 Comandos Git Rápidos

```bash
# Crear rama
git checkout -b feat/mi-feature

# Commit
git add .
git commit -m "[feat] Descripción - Agentes aplicados"

# Push y PR
git push origin feat/mi-feature
# → Abre PR en GitHub

# Actualizar con main
git fetch origin main
git rebase origin/main

# Descartar cambios
git checkout -- archivo.ts

# Ver cambios
git diff
git log --oneline -10
```

---

## 🙋 Preguntas Rápidas

### "El test no pasa"
```bash
npm run test -- --verbose      # Más detalles
npm run test:watch             # Modo watch
npm run test -- tests/archivo.spec.ts  # Solo un archivo
```

### "ESLint me dice que hay un error"
```bash
npm run lint -- --fix          # Auto-corregir
npm run format                 # Prettier
```

### "Build falla"
```bash
npm run build --verbose        # Ver más info
npm run type-check             # TypeScript
npm run build:api -- --watch   # Modo watch backend
```

### "Performance lenta en frontend"
```bash
# 1. Abre Chrome DevTools
# 2. Performance tab → Record
# 3. Haz la acción
# 4. Para recording y analiza

# O corre Lighthouse
ng build --stats-json
# Abre https://webpack.github.io/analyse con stats.json
```

### "Mi componente se re-renderiza mucho"
```typescript
// Añade OnPush
@Component({
  ...
  changeDetection: ChangeDetectionStrategy.OnPush
})

// Añade trackBy en listas
*ngFor="let item of items; trackBy: trackByFn"

trackByFn(index: number, item: Item): any {
  return item.id;  // 🙋 crucial
}
```

---

## 📚 Estructura de PR

```markdown
## 🎯 Objetivo
[Descripción clara de qué se hace]

## 📝 Cambios
- [Cambio 1]
- [Cambio 2]

## 🤖 Agentes Aplicados
- backend-ordenes.agent.md: Patrón de endpoint
- frontend-api-integration.agent.md: Cómo consumirlo
- quality-testing.agent.md: Tests unitarios

## ✅ Testing
- [ ] Tests unitarios: npm run test (✅ 85% coverage)
- [ ] Tests E2E: npm run test:e2e (✅ flujos críticos)
- [ ] Manual: [pasos para probar manualmente]

## 📊 Validación Final
- [x] npm run lint (✅ sin errores)
- [x] npm run type-check (✅ OK)
- [x] npm run build (✅ sin errores)
- [x] npm run test -- --coverage (✅ >80%)
```

---

## 📎 Documentación Rápida

**Si necesitas...**

| Busca en... | Tiempo |
|-------------|--------|
| Entender arquitectura global | README.md | 5 min |
| Encontrar el agente correcto | .github/AGENTS.md | 2 min |
| Setup inicial | .github/ONBOARDING.md | 10 min |
| Estructura de una tarea | .github/TASK_TEMPLATE.md | 3 min |
| Patrón de [FEATURE] | .github/agents/[feature].agent.md | 5 min |
| Código de ejemplo | Busca en `apps/` u otros PRs | 5 min |

---

## 📾 Atajos Navegación

```
🎯 QUIERO VER...

Todos los agentes        → .github/agents/
CODIGO AGENTS            → .github/AGENTS.md
Plantilla para tareas     → .github/TASK_TEMPLATE.md
ONBOARDING               → .github/ONBOARDING.md
README principal         → README.md
CHEATSHEET (aquí)       → .github/QUICK_REFERENCE.md
CÓDIGO BACKEND          → apps/api/src/
CÓDIGO FRONTEND         → apps/web/src/
WORKFLOWS CI/CD          → .github/workflows/
```

---

## 🛐 Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| "module not found" | `npm install`, limpia node_modules, rebuild |
| "port 3000 already in use" | `lsof -i :3000 | kill` o cambia en config |
| "DB connection refused" | Verifica `docker-compose up`, PostgreSQL activo |
| "CORS error" | Revisa backend-auth.agent.md, CORS config |
| "Tests timeout" | Aumenta timeout en jest.config, revisa queries |
| "Build muy lento" | Verifica cache, webpack bundle analyzer |
| "Memory leak" | Usa DevTools, verifica unsubscribes, takeUntil |

---

**Última actualización:** 2026-01-02
**Versión:** 1.0
**📖 Siempre ten esto a mano!**
