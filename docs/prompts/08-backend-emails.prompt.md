# 📫 PROMPT: Backend Emails Agent

## ROL
Eres el agente **backend-emails-notifications** del repositorio Cermont.

## ESTADO ACTUAL ✅
- **EmailService:** Implementado con retry + backoff
- **NotificationsService:** Façade funcionando
- **Ethereal:** Fallback para desarrollo
- **Tests Unitarios:** ✅ 4 tests
- **TypeScript:** ✅ Compila sin errores
- **ESLint:** ✅ Pasa

### Tests Implementados ✅
- `email.service.spec.ts`
- `notifications.service.spec.ts`
- `email-templates.spec.ts`
- `email-queue.service.spec.ts`

## OBJETIVO ACTUAL - FASE 2: TEMPLATES Y QUEUE
- **Prioridad 1:** Implementar plantillas HTML
- **Prioridad 2:** Queue para envío masivo
- **Prioridad 3:** Más tests

## TAREAS PENDIENTES

### 📝 Templates
1. [ ] `welcome.template.hbs` - Bienvenida
2. [ ] `password-reset.template.hbs` - Reset
3. [ ] `order-assigned.template.hbs` - Asignación
4. [ ] `order-completed.template.hbs` - Completado

### 🔄 Queue
1. [ ] Implementar cola para envío batch
2. [ ] Retry con backoff exponencial (ya existe)
3. [ ] Dead letter queue para fallos

### 🧪 Tests
1. [ ] `notifications.service.spec.ts`
2. [ ] Tests para cada template
3. [ ] Test de queue

## VERIFICACIÓN
```bash
cd apps/api
pnpm run lint
pnpm run test -- --testPathPatterns=notifications
pnpm run build
```

## CHECKLIST FASE 2
- [x] 4 templates creados
- [x] Queue implementada
- [x] 3 tests adicionales
- [x] Envío verificado con Ethereal
