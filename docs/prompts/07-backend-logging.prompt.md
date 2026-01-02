# 🔍 PROMPT: Backend Logging Agent

## ROL
Eres el agente **backend-logging-observability** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **LoggerService:** Centralizado en `lib/logging`
- **Re-export:** `common/logging` redirige correctamente
- **Pino:** Configurado con pino-pretty
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

## OBJETIVO ACTUAL - FASE 2: INTERCEPTORS Y AUDITORÍA
- **Prioridad 1:** Implementar HTTP Request Interceptor
- **Prioridad 2:** Sanitización de datos sensibles
- **Prioridad 3:** Log rotation y archivos

## TAREAS PENDIENTES

### 🟡 Interceptors
1. [ ] `http-logging.interceptor.ts` - Log de todas las requests
2. [ ] Registrar en AppModule como global
3. [ ] Incluir timing de respuesta

### 🔒 Seguridad
1. [ ] Sanitizar passwords en logs
2. [ ] Sanitizar tokens en logs
3. [ ] No loguear datos PII

### 📝 Archivos
1. [ ] Configurar log rotation
2. [ ] Separar por nivel (error, info)
3. [ ] Retención configurable

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPattern=logging
pnpm run build
```

## CHECKLIST FASE 2
- [ ] Interceptor HTTP registrado
- [ ] Datos sensibles sanitizados
- [ ] Log rotation configurado
- [ ] Tests para interceptor
