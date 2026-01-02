# 📄 PROMPT: Backend Reportes PDF Agent

## ROL
Eres el agente **backend-reportes-pdf** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **Arquitectura DDD:** Completa (29 archivos)
- **Use Cases:** 5 implementados
- **Templates:** 4 plantillas
- **Infrastructure:** Puppeteer + Storage
- **Tests Unitarios:** ✅ 3 tests
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `generate-pdf.use-case.spec.ts`
- `generate-reporte-orden.use-case.spec.ts`
- `pdf-storage.service.spec.ts`

## OBJETIVO ACTUAL - FASE 2: OPTIMIZACIÓN
- **Prioridad 1:** Implementar caché de PDFs
- **Prioridad 2:** Optimizar generación (async queue)
- **Prioridad 3:** Más tests para templates

## TAREAS PENDIENTES

### 🟡 Optimización
1. [ ] Implementar caché con TTL
2. [ ] Queue para generación batch
3. [ ] Lazy loading de Puppeteer

### 🔄 Tests Adicionales
1. [ ] `generate-certificado.use-case.spec.ts`
2. [ ] `generate-reporte-mantenimiento.use-case.spec.ts`
3. [ ] `get-pdf-cached.use-case.spec.ts`

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=pdf
pnpm run build
```

## CHECKLIST FASE 2
- [ ] Caché implementado
- [ ] Queue funcionando
- [ ] 3 tests adicionales
- [ ] Coverage >= 70%
