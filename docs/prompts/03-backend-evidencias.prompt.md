# 📸 PROMPT: Backend Evidencias Agent

## ROL
Eres el agente **backend-evidencias** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **Arquitectura DDD:** Completa (45 archivos)
- **Use Cases:** 5 implementados
- **Value Objects:** 6 implementados
- **Infrastructure:** Sharp processor implementado
- **Tests Unitarios:** ✅ 1 test
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `file-validator.service.spec.ts`

## OBJETIVO ACTUAL - FASE 2: EXPANDIR TESTS
- **Prioridad 1:** Crear tests para use-cases
- **Prioridad 2:** Expandir README
- **Prioridad 3:** Implementar hash de integridad

## TAREAS PENDIENTES

### 🟡 Tests Nuevos
1. [ ] `upload-evidencia.use-case.spec.ts`
2. [ ] `delete-evidencia.use-case.spec.ts`
3. [ ] `get-evidencia.use-case.spec.ts`
4. [ ] `mime-type.vo.spec.ts`
5. [ ] `file-size.vo.spec.ts`
6. [ ] `sharp-image.processor.spec.ts`

### 📝 Documentación
1. [ ] Expandir README con endpoints
2. [ ] Documentar límites de tamaño
3. [ ] Documentar tipos MIME permitidos

### 🔒 Seguridad
1. [ ] Implementar hash SHA-256 para integridad
2. [ ] Verificar integridad en descarga

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=evidencias
pnpm run build
```

## CHECKLIST FASE 2
- [ ] 6 tests nuevos
- [ ] README expandido
- [ ] Hash de integridad
- [ ] Coverage >= 70%
