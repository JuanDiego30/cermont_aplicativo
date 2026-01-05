# 🤖 Cermont Agents Prompts

Este directorio contiene los prompts especializados para cada uno de los 22 Agentes del Sistema Cermont (Antigravity).

**Última Actualización:** 2026-01-05 (Foundation + ajustes Auth/Security)

---

## 📂 Organización

### Foundation (Sprint 1)
| ID | Agente | Responsabilidad | Status |
|----|--------|----------------|--------|
| `FND-01` | Foundation | Repo verde, secrets, métricas | ✅ OK |

### Backend Agents (01-10 + 21)
| ID | Agente | Responsabilidad | Status |
|----|--------|----------------|--------|
| `01` | Auth | Login, JWT, ACL | ✅ OK |
| `02` | Ordenes | Estados, Cálculos | ✅ OK |
| `03` | Evidencias | Archivos, S3 | ✅ OK |
| `04` | Formularios | JSON Schema | ✅ OK |
| `05` | Sync | Offline, Conflictos | ✅ OK |
| `06` | Reportes | PDF Generation | ✅ OK |
| `07` | Logging | Logs, Secrets | ✅ OK |
| `08` | Emails | BullMQ, Templates | ✅ OK |
| `09` | Caching | Redis, TTL | ✅ OK |
| `10` | API Docs | Swagger | ✅ OK |
| `21` | Security | CORS, Rate Limit | ✅ OK |

### Frontend Agents (11-16 + 19, 20)
| ID | Agente | Responsabilidad | Status |
|----|--------|----------------|--------|
| `11` | Umbrella | Arquitectura | ⚠️ Issues Transversales |
| `12` | API | Http Client | ⚠️ Fix Error Types |
| `13` | UI/UX | Componentes | ⚠️ Fix Table Types |
| `14` | State | Signals, RxJS | 🚨 Memory Leaks |
| `15` | Performance | Bundle, Vitals | ⚠️ Linked to Leaks |
| `16` | I18n | Traducciones | ✅ OK |
| `19` | Auth Crit. | Login Flow | ✅ Leaks corregidos |
| `20` | Shared | Reusable | ⚠️ Shared Types |

### DevOps & Testing (17, 18, 22)
| ID | Agente | Responsabilidad | Status |
|----|--------|----------------|--------|
| `17` | DevOps | CI/CD, Docker | ✅ OK |
| `18` | Quality | Unit Testing | ✅ OK |
| `22` | Integration | E2E Tests | ⚠️ Missing Login E2E |

---

## 🛠️ Cómo Usar

1. Abre el archivo `00-invoke-agents.md`.
2. Copia el bloque de invocación del agente que necesitas.
3. Pégalo en el chat con tu modelo de IA.
4. El agente ejecutará su análisis específico y te propondrá un plan.

---

## 🔴 Research Findings (2026-01-05)

Todos los prompts han sido actualizados con una sección **"ESTADO ACTUAL Y VIOLACIONES"** que detalla:
- **Violaciones de Type Safety (`: any`)** con archivo y línea específica.
- **Memory Leaks** detectados (suscripciones sin limpiar).
- **Checks de Seguridad** validados.

**Prioridad Inmediata:** Corregir Memory Leaks (Agent 14/19) y Tipado crítico (Backend).
