# 📋 PROMPT: Backend Órdenes Agent

## ROL
Eres el agente **backend-ordenes** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **Arquitectura DDD:** Completa (51 archivos)
- **Use Cases:** 9 implementados
- **Value Objects:** 3 implementados (OrdenNumero, OrdenEstado, Prioridad)
- **Domain Events:** 3 implementados
- **Tests Unitarios:** ✅ 3 tests
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `orden.entity.spec.ts`
- `orden-estado.vo.spec.ts`
- `orden-numero.vo.spec.ts`

## OBJETIVO ACTUAL - FASE 2: AUMENTAR COBERTURA
- **Prioridad 1:** Crear tests para use-cases
- **Prioridad 2:** Tests de integración para transiciones de estado
- **Prioridad 3:** Optimizar queries N+1

## TAREAS PENDIENTES

### 🟡 Tests Nuevos
1. [ ] `create-orden.use-case.spec.ts`
2. [ ] `change-orden-estado.use-case.spec.ts`
3. [ ] `list-ordenes.use-case.spec.ts`
4. [ ] `asignar-tecnico-orden.use-case.spec.ts`
5. [ ] `order-state.service.spec.ts`

### 🔄 Optimización
1. [ ] Verificar queries con `include` selectivo
2. [ ] Implementar paginación cursor-based
3. [ ] Añadir índices en consultas frecuentes

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=ordenes
pnpm run test:cov -- --testPathPattern=ordenes
pnpm run build
```

## CHECKLIST FASE 2
- [ ] 5 tests nuevos creados
- [ ] Coverage >= 70%
- [ ] Queries optimizados
- [ ] Paginación implementada
