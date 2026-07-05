# Plan de pruebas offline/online

## 1. Pruebas automatizadas actuales

| Área | Prueba | Estado |
|---|---|---|
| Contratos compartidos | `packages/shared-types/tests/schemas/offline-sync.schema.test.ts` | Implementada |
| Registro SW | `frontend/tests/modules/core/pwa/service-worker-registration.test.tsx` | Existente y vigente |
| Reglas de bypass SW | `frontend/tests/public/service-worker.bypass.test.ts` | Actualizada a Serwist source |
| TypeScript frontend | `npm --workspace frontend run typecheck` | Ejecutar en gates |
| TypeScript shared-types | `npm --workspace packages/shared-types run typecheck` | Ejecutar en gates |

## 2. Pruebas manuales recomendadas

1. Ejecutar build de frontend.
2. Abrir la app en línea.
3. Iniciar sesión.
4. Entrar a planeación o ejecución.
5. Cortar la red desde DevTools.
6. Recargar una ruta ya visitada.
7. Verificar fallback o app shell cacheado.
8. Crear un borrador o cambio offline.
9. Adjuntar evidencia local cuando el formulario lo permita.
10. Confirmar que el elemento aparece como pendiente.
11. Restaurar internet.
12. Verificar intento de sincronización.
13. Confirmar ACK del backend.
14. Verificar que un reintento no duplique registros por `idempotencyKey`.
15. Cerrar sesión y confirmar que no se sincroniza sin sesión activa.

## 3. Pruebas E2E pendientes

- Corte real de red con Playwright.
- Creación de planeación offline y sincronización posterior.
- Checklist offline con conflicto de versión.
- Evidencia con Blob en Dexie y subida posterior.
- Orden cerrada en servidor mientras el usuario trabaja offline.
- Usuario sin permiso al momento de sincronizar.

## 4. Gates obligatorios

Antes de declarar completado el módulo se deben ejecutar:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
npx react-doctor@latest
```

Si un gate falla, el módulo no debe reportarse como completo.
