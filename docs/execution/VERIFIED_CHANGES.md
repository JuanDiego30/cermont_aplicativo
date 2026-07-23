# Verified Changes — CERMONT

> Cambios verificados con gates, pruebas y revisión funcional.

---

## Fase 01 — Authentication / Password Recovery / Email Delivery

**Status:** `review` — Falta E2E en frontend real y sandbox SMTP verificable.

### Backend — auth.service.ts
| Cambio | Estado |
|--------|--------|
| `generateResetToken()` — stub `""` reemplazado por `crypto.randomBytes(32)` + SHA-256 hash + persistencia | ✅ |
| `resetPassword()` — stub con excepción reemplazado por timing-safe compare + bcrypt vía model hook + session revocation | ✅ |
| Auditoría: eventos `PASSWORD_RESET_REQUESTED` y `PASSWORD_RESET_COMPLETED` | ✅ |
| `AUDIT_ACTIONS` en shared-types actualizado | ✅ |
| `bcrypt` import removido (usa model hook) | ✅ |

### Backend — auth.controller.ts
| Cambio | Estado |
|--------|--------|
| `forgotPassword()` ahora captura token retornado y envía email | ✅ |
| Anti-enumeration: misma respuesta 200 para email existente/inexistente | ✅ |

### Backend — auth-email.service.ts (nuevo)
| Cambio | Estado |
|--------|--------|
| Servicio separado con plantilla HTML para reset | ✅ |
| Usa `emailGateway.send()` (nodemailer SMTP / dev logger) | ✅ |

### Shared Types — audit-actions.ts
| Cambio | Estado |
|--------|--------|
| `PASSWORD_RESET_REQUESTED` y `PASSWORD_RESET_COMPLETED` agregados | ✅ |
| Snapshot de contratos regenerado + migration manifest actualizado | ✅ |

### Gates
| Gate | Resultado |
|------|-----------|
| `npm run typecheck` | ✅ 7/7 workspaces |
| `npm run lint` | ✅ 7/7 (0 errores, 3 style infos) |
| `npm run test -w backend` | ✅ 5 controller tests pass (auth.controller.test.ts pasa) |
| `npm run test` shared-types | ✅ 184/184 pass |
| `npm run build` | ✅ 5/5 workspaces, 99 rutas frontend |

### Documentación
| Documento | Cambio |
|-----------|--------|
| `docs/DEVELOPMENT_STATUS.md` | Auth recovery: `partial` → `implemented` |
| `docs/KNOWN_DEFECTS.md` | DEF-001: `open` → `fixed` |
| `docs/execution/ACTIVE_SLICE.md` | Creada con scope y evidencia |
| `docs/execution/REMEDIATION_BACKLOG.md` | 20 defectos priorizados |
| `docs/modules/auth/SPEC.md` | Especificación completa |

### Pendiente para `verified`
- [ ] Playwright E2E: forgot-password → email → reset → login
- [ ] Sandbox SMTP verificable (Mailtrap)
- [ ] Validar `FRONTEND_URL` en producción
- [ ] Screenshots del flujo completo
