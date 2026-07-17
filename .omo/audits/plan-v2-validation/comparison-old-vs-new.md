# Comparación: Plan Original vs Plan Corregido

## Cambio fundamental

El plan original (`PLAN_IMPLEMENTACION_CERMONT_v2.0_original.md`) asumía 40% del esfuerzo en infraestructura paga.
El plan corregido (`PLAN_IMPLEMENTACION_CERMONT_v2.0.md`) invierte 100% en funcionalidad y contenido.

## Lo que se ELIMINÓ del plan (porque son pagos o no críticos)

| Item | Plan original | Plan corregido | Ahorro |
|---|---|---|---|
| Redis | 20h (S6.1) | 0h | 20h |
| BullMQ | 20h (implícito) | 0h | 20h |
| OpenTelemetry | 25h (S6.4) | 0h | 25h |
| Sentry | incluido en S6.4 | 0h | 10h |
| CDN | 15h (S6.3) | 0h | 15h |
| Vercel AI SDK + OpenAI/Anthropic | 120h (S4.1-S4.6) | 0h | 120h |
| MinIO/S3 | 20h (implícito) | 0h | 20h |
| Leaflet/react-leaflet | 15h (stack) | 0h | 15h |
| @zxing/library | 10h (stack) | 0h | 10h |
| Socket.io | 15h (S2.4) | 0h | 15h |
| @dnd-kit | 25h (S2.7) | 0h | 25h |
| Ariba integration | 40h (S3.2) | 0h | 40h |
| DIAN sandbox | 45h (S3.3) | 0h | 45h |
| MFA/TOTP | 25h (S5.1) | 0h | 25h |
| MongoDB sharding | 25h (S6.2) | 0h | 25h |
| **Total eliminado** | **~420h** | **0h** | **420h ahorrados** |

## Lo que se MANTIENE del stack actual (sin cambios)

| Tecnología | Versión | Propósito |
|---|---|---|
| Express 5.2.1 | ✅ Ya instalado | Backend |
| Next.js 16 | ✅ Ya instalado | Frontend |
| MongoDB + Mongoose | ✅ Ya instalado | Base de datos |
| Zod 4.x | ✅ Ya instalado | Validación |
| TanStack Query | ✅ Ya instalado | Server state |
| Zustand 5.x | ✅ Ya instalado | Client state |
| Tailwind CSS 4.x | ✅ Ya instalado | Estilos |
| Lucide React | ✅ Ya instalado | Iconos |
| Recharts | ✅ Ya instalado | Gráficos |
| Framer Motion | ✅ Ya instalado | Animaciones |
| Radix UI | ✅ Ya instalado | Componentes accesibles |
| Vitest | ✅ Ya instalado | Testing |
| Biome | ✅ Ya instalado | Linting |
| Serwist | ✅ Ya instalado | PWA |
| Dexie.js | ✅ Ya instalado | IndexedDB |

## Nueva estructura de sprints

| Sprint | Enfoque | Horas | Dependencias pagas |
|---|---|---|---|
| Sprint 1 | KPIs contextuales CERMONT + Dashboard | 200h | 0 |
| Sprint 2 | Sistema de diseño v4.0 | 200h | 0 |
| Sprint 3 | Flujo de 14 pasos — contenido real | 200h | 0 |
| Sprint 4 | Refactor de calidad frontend | 200h | 0 |
| **Total** | **Funcionalidad + Contenido** | **800h** | **0** |

## Impacto en la auditoría

| Métrica | Antes del ajuste | Después del ajuste |
|---|---|---|
| Brechas P0 | React Doctor 76 + E2E no ejecutable | React Doctor 76 + E2E no ejecutable |
| Brechas P1 | 8 (incluía MFA, DIAN, Ariba) | 5 (MFA/DIAN/Ariba pasan a WON'T FIX) |
| Brechas P2 | 15 (incluía Redis, OTEL, CDN) | 10 (Redis/OTEL/CDN eliminados) |
| Brechas P3 | 12 (incluía predicciones IA) | 8 (IA predictions eliminadas) |
| Madurez producción | CONDITIONAL GO | **GO** (sin condiciones de infraestructura) |
| Costo implementación | Múltiples servicios pagos | $0 adicionales |
