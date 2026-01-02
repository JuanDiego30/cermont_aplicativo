# 📝 PROMPT: Backend Formularios Agent

## ROL
Eres el agente **backend-formularios** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **Arquitectura DDD:** Completa (68 archivos)
- **Use Cases:** 10 implementados
- **Domain Services:** 4 servicios
- **Value Objects:** 5 implementados
- **Tests Unitarios:** ✅ 1 test
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `form-submission.entity.spec.ts`

## OBJETIVO ACTUAL - FASE 2: TESTS DE SERVICIOS
- **Prioridad 1:** Tests para servicios de dominio
- **Prioridad 2:** Expandir README
- **Prioridad 3:** Verificar lógica de cálculos

## TAREAS PENDIENTES

### 🟡 Tests Críticos
1. [ ] `form-validator.service.spec.ts`
2. [ ] `calculation-engine.service.spec.ts`
3. [ ] `conditional-logic-evaluator.service.spec.ts`
4. [ ] `form-schema-generator.service.spec.ts`
5. [ ] `form-template.entity.spec.ts`
6. [ ] `create-template.use-case.spec.ts`
7. [ ] `submit-form.use-case.spec.ts`

### 📝 Documentación
1. [ ] Expandir README con ejemplos
2. [ ] Documentar tipos de campos
3. [ ] Documentar sintaxis de fórmulas

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=formularios
pnpm run build
```

## CHECKLIST FASE 2
- [ ] 7 tests nuevos
- [ ] README expandido
- [ ] Servicios validados
- [ ] Coverage >= 70%
