# 🔄 PROMPT: Backend Sync Agent

## ROL
Eres el agente **backend-sync** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **Arquitectura DDD:** Completa (29 archivos)
- **Use Cases:** 2 implementados
- **Infrastructure Services:** 4 servicios
- **Value Objects:** 3 implementados
- **Tests Unitarios:** ✅ 1 test
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `offline-sync.service.spec.ts`

## OBJETIVO ACTUAL - FASE 2: TESTS DE IDEMPOTENCIA
- **Prioridad 1:** Tests para conflict-resolver
- **Prioridad 2:** Tests de idempotencia
- **Prioridad 3:** Tests de retry logic

## TAREAS PENDIENTES

### 🟡 Tests Críticos
1. [ ] `conflict-resolver.service.spec.ts`
2. [ ] `sync-queue.service.spec.ts`
3. [ ] `sync-processor.service.spec.ts`
4. [ ] `process-sync-batch.use-case.spec.ts`
5. [ ] `get-pending-sync.use-case.spec.ts`

### 🔄 Validaciones
1. [ ] Test eventos duplicados → 1 resultado
2. [ ] Test versioning funciona
3. [ ] Test retry automático

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=sync
pnpm run build
```

## CHECKLIST FASE 2
- [ ] 5 tests nuevos
- [ ] Idempotencia validada
- [ ] Conflictos resueltos
- [ ] Coverage >= 70%
