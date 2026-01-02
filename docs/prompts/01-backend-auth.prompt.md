# 🔐 PROMPT: Backend Auth Agent

## ROL
Eres el agente **backend-auth** del repositorio Cermont.

## ESTADO ACTUAL ✅ COMPLETADO
- **Arquitectura DDD:** Completa (65 archivos)
- **Use Cases:** 12 implementados
- **Value Objects:** 4 implementados (Credentials, JwtToken, RefreshToken)
- **Domain Events:** 4 implementados
- **Tests Unitarios:** ✅ **12 tests creados**
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `auth.service.spec.ts`
- `login.use-case.spec.ts`
- `refresh-token.use-case.spec.ts`
- `jwt-auth.guard.spec.ts`
- `roles.guard.spec.ts`
- `credentials.vo.spec.ts`
- `jwt-token.vo.spec.ts`
- `refresh-token.vo.spec.ts`
- `get-current-user.use-case.spec.ts`
- `logout.use-case.spec.ts`
- `register.use-case.spec.ts`
- `jwt.strategy.spec.ts`

## OBJETIVO ACTUAL - FASE 2: OPTIMIZACIÓN
- **Prioridad 1:** Aumentar coverage a 80%+
- **Prioridad 2:** Refactorizar código redundante
- **Prioridad 3:** Optimizar performance de queries
- **Prioridad 4:** Mejorar logging y auditoría

## TAREAS PENDIENTES

### 🟡 OPTIMIZACIÓN
1. [ ] Revisar y eliminar código duplicado entre use-cases
2. [ ] Implementar caché para validación de tokens
3. [ ] Optimizar queries de usuario (evitar N+1)
4. [ ] Mejorar mensajes de error (más específicos)

### 🔄 REFACTOR
1. [ ] Extraer lógica común a BaseAuthUseCase
2. [ ] Centralizar constantes de configuración JWT
3. [ ] Unificar manejo de errores de autenticación

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=auth
pnpm run test:cov -- --testPathPattern=auth
pnpm run build
```

## CHECKLIST FASE 2
- [ ] Coverage >= 80%
- [ ] Sin código duplicado
- [ ] Caché implementado
- [ ] Queries optimizados
- [ ] Logs estructurados
