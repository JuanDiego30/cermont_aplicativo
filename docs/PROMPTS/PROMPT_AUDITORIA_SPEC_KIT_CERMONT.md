# PROMPT MAESTRO — Auditoría integral CERMONT con GitHub Spec Kit

Actúa como un **Staff Software Architect + Tech Lead + Security Engineer + QA Lead + Compliance Analyst**, experto en GitHub Spec Kit, Spec-Driven Development, Next.js, React, TypeScript estricto, Node.js/Express, MongoDB/Mongoose, Zod, Contract-First, TanStack Query, RBAC, JWT, cookies seguras, auditoría, Docker, Nginx/Caddy/Apache, SSL/TLS, HTTPS, Certbot/Let's Encrypt, OWASP y protección de datos personales en Colombia.

Voy a trabajar sobre el aplicativo web de **CERMONT S.A.S.**, una plataforma operativa para gestión de órdenes de trabajo, recursos, vehículos, herramientas, evidencias, documentos, planeación, ejecución, informes, actas, SES, facturación, pagos, KPIs y trazabilidad del flujo operativo de 14 pasos.

Necesito una auditoría profesional y una actualización de documentación usando enfoque **Spec Kit / Spec-Driven Development**.

---

## 1. Objetivo principal

Realizar una auditoría integral del estado actual del aplicativo para responder con evidencia técnica:

1. Si el frontend realmente está consumiendo los endpoints del backend.
2. Si existen endpoints backend que no están siendo consumidos.
3. Si existen llamadas frontend que apuntan a endpoints inexistentes o incorrectos.
4. Si frontend, backend y contratos compartidos cumplen el mismo contrato de datos.
5. Si los schemas Zod, DTOs, modelos Mongoose, servicios, controllers, rutas, API clients, hooks y UI están alineados.
6. Si hay inconsistencias de rutas, métodos HTTP, params, query params, payloads, response envelopes, errores o permisos.
7. Si el sistema cumple requisitos legales mínimos para reducir riesgo de multas por protección de datos.
8. Si SSL/HTTPS está correctamente configurado en entorno de despliegue.
9. Si hay riesgos de seguridad, privacidad, datos personales, evidencias fotográficas, geolocalización, documentos o control de acceso.
10. Si la documentación actual refleja realmente cómo va el desarrollo.
11. Si se deben crear specs, planes y tasks siguiendo GitHub Spec Kit.

---

## 2. Modo de trabajo con GitHub Spec Kit

Si el repositorio ya tiene Spec Kit instalado, usa el flujo:

```txt
/speckit.constitution
/speckit.specify
/speckit.clarify
/speckit.plan
/speckit.tasks
/speckit.implement
```

Si el repositorio no tiene Spec Kit instalado, no inventes comandos. Crea manualmente la estructura compatible:

```txt
.specify/
  memory/
    constitution.md

specs/
  001-auditoria-integral-cermont/
    spec.md
    plan.md
    tasks.md
    research.md
    data-model.md
    contracts/
      api-audit.md
      frontend-backend-matrix.md
      openapi-detected.yaml
    quickstart.md
    legal-compliance.md
    ssl-https-audit.md
```

El enfoque debe ser **spec-first**: primero documentar la especificación y los criterios de aceptación, luego planear, luego generar tareas, luego implementar ajustes.

---

## 3. Constitución técnica del proyecto

Antes de auditar o modificar código, crea o actualiza:

```txt
.specify/memory/constitution.md
```

La constitución debe declarar como principios no negociables:

1. **Contract-First:** todo cambio inicia en schemas/contratos compartidos.
2. **Single Source of Truth:** roles, permisos, estados, rutas, query keys y schemas no se duplican.
3. **Frontend must consume real backend endpoints:** prohibido dejar datos mock en pantallas productivas sin marcarlo como demo.
4. **Backend authority:** el backend valida autenticación, autorización, payloads y reglas de negocio.
5. **No silent failures:** errores visibles, tipados y auditables.
6. **No `any`:** TypeScript estricto.
7. **No endpoints huérfanos:** cada endpoint debe tener consumidor, test o justificación.
8. **No UI calls inexistentes:** cada llamada del frontend debe mapear a una ruta real.
9. **Data protection by design:** datos personales, fotos, GPS, firmas y documentos deben tener finalidad, autorización, controles y retención.
10. **HTTPS required in production:** producción no debe operar por HTTP plano.
11. **Auditability:** acciones críticas registradas.
12. **Documentation as living artifact:** README, API docs, deployment docs y development status deben reflejar el estado real.

---

## 4. Fase 1 — Auditoría inicial del repositorio

No cambies código todavía.

Primero revisa y documenta:

### 4.1 Estructura del proyecto

Busca:

- `package.json` raíz;
- `apps/frontend`;
- `apps/backend`;
- `packages/shared-types`;
- `packages/domain`;
- `src/routes`;
- `src/controllers`;
- `src/services`;
- `src/models`;
- `src/schemas`;
- `src/lib/api`;
- `src/hooks`;
- `src/queryKeys`;
- `docs`;
- `README.md`;
- `docker-compose.yml`;
- `Dockerfile`;
- `.env.example`;
- `nginx.conf`;
- `Caddyfile`;
- configuración de VPS/deploy.

Genera:

```txt
docs/audits/REPOSITORY_STRUCTURE_AUDIT.md
```

Debe incluir:

- estructura real encontrada;
- stack detectado;
- scripts disponibles;
- módulos principales;
- riesgos iniciales.

---

## 5. Fase 2 — Auditoría de endpoints backend

Detecta todas las rutas backend reales.

Revisa:

- Express routers;
- controllers;
- route registration;
- middlewares;
- OpenAPI/Swagger si existe;
- auth middleware;
- RBAC middleware;
- validación Zod;
- response envelope;
- error handler.

Genera:

```txt
docs/audits/BACKEND_ENDPOINT_INVENTORY.md
```

Formato:

| Método | Ruta | Controller | Service | Auth | RBAC | Zod schema | Modelo | Response | Test | Estado |
|---|---|---|---|---|---|---|---|---|---|---|

Clasifica cada endpoint:

- `implemented`
- `partial`
- `missing-validation`
- `missing-rbac`
- `missing-test`
- `deprecated`
- `unused`
- `broken`

---

## 6. Fase 3 — Auditoría de consumo frontend

Detecta todas las llamadas frontend a la API.

Busca:

- `fetch`;
- `axios`;
- `apiClient`;
- `TanStack Query`;
- `useQuery`;
- `useMutation`;
- services por módulo;
- query keys;
- hooks custom;
- Server Actions, si aplica;
- rutas hardcodeadas;
- mocks;
- datos estáticos.

Genera:

```txt
docs/audits/FRONTEND_API_CONSUMPTION_AUDIT.md
```

Formato:

| Módulo UI | Componente / Hook | Método | Endpoint llamado | Query key | Contrato usado | Backend existe | Estado |
|---|---|---|---|---|---|---|---|

Clasifica:

- `connected`
- `mock-only`
- `wrong-path`
- `wrong-method`
- `wrong-payload`
- `missing-backend`
- `missing-hook`
- `direct-fetch-in-component`
- `needs-refactor`

Reglas:

1. Si un componente llama `fetch` directamente, proponer refactor a service + hook.
2. Si hay mocks en dashboard o módulos productivos, marcarlos claramente.
3. Si el frontend muestra datos que no vienen del backend, documentarlo.
4. Si hay endpoints backend sin uso, listar como huérfanos.

---

## 7. Fase 4 — Matriz frontend vs backend

Cruza rutas frontend y backend.

Genera:

```txt
docs/audits/FRONTEND_BACKEND_ENDPOINT_MATRIX.md
```

Formato:

| Funcionalidad | Frontend call | Backend route | Coincide método | Coincide path | Coincide params | Coincide body | Coincide response | Estado | Acción |
|---|---|---|---|---|---|---|---|---|---|

Debe detectar:

- endpoints backend no consumidos;
- endpoints frontend inexistentes;
- endpoints con path distinto;
- endpoints con método distinto;
- payloads incompatibles;
- responses incompatibles;
- errores no manejados;
- falta de loading/error/empty states;
- falta de invalidación de queries;
- falta de pruebas.

---

## 8. Fase 5 — Auditoría de contratos

Revisa alineación entre:

```txt
Zod schema → TypeScript type → DTO → Mongoose model → Service → Controller → Route → API client → Query hook → UI
```

Genera:

```txt
docs/audits/CONTRACT_COMPLIANCE_AUDIT.md
```

Debe incluir por módulo:

- auth;
- users;
- work requests;
- service cases;
- work orders;
- planning;
- resources;
- tools;
- vehicles;
- evidences;
- documents;
- checklists;
- maintenance;
- invoices;
- payments;
- notifications;
- dashboard/KPIs.

Para cada módulo responde:

1. ¿Existe schema Zod?
2. ¿El frontend usa tipos inferidos del schema?
3. ¿El backend valida params/query/body?
4. ¿El modelo Mongoose coincide con el schema?
5. ¿La respuesta API usa formato estándar?
6. ¿El frontend espera el mismo formato?
7. ¿Hay tests de contrato?
8. ¿Qué ajustes se requieren?

Formato de respuesta API esperado:

```json
{
  "success": true,
  "data": {}
}
```

Errores:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje legible"
  }
}
```

---

## 9. Fase 6 — Auditoría legal y cumplimiento Colombia

Importante: no des asesoría jurídica definitiva. Genera un **informe técnico de cumplimiento para revisión legal**.

Analiza si la app trata datos personales o sensibles, por ejemplo:

- nombres;
- correos;
- teléfonos;
- cargos;
- roles;
- firmas;
- fotos;
- rostros;
- documentos;
- geolocalización;
- evidencias en campo;
- certificados laborales;
- información de SST/HSE;
- placas de vehículos asociadas a personas;
- auditorías de usuario;
- logs.

Genera:

```txt
docs/compliance/LEGAL_COMPLIANCE_AUDIT_COLOMBIA.md
docs/compliance/DATA_INVENTORY_AND_PRIVACY_MAP.md
docs/compliance/PRIVACY_RISK_BACKLOG.md
```

### 9.1 Revisar contra Ley 1581 de 2012

Verifica técnicamente si el sistema tiene soporte para:

- autorización previa, expresa e informada;
- finalidad del tratamiento;
- política de tratamiento de datos personales;
- aviso de privacidad;
- identificación del responsable/encargado;
- derechos del titular;
- canal para consultas y reclamos;
- prueba de autorización;
- minimización de datos;
- conservación limitada;
- supresión o anonimización;
- seguridad de la información;
- acceso restringido por rol;
- trazabilidad de acceso;
- gestión de incidentes;
- backup y recuperación;
- transferencia/transmisión de datos si aplica.

### 9.2 Revisión de RNBD

Verificar si la empresa podría estar obligada a registrar bases de datos en el RNBD.

No afirmes obligación sin datos financieros reales. Debes dejarlo como verificación:

```txt
¿CERMONT tiene activos totales superiores a 100.000 UVT?
Sí / No / No verificado
```

Si no está verificado, crear task:

```txt
Solicitar a administración/contador confirmar si CERMONT supera 100.000 UVT en activos para evaluar obligación RNBD.
```

### 9.3 Evidencias fotográficas y geolocalización

Como la app permite fotos y posiblemente GPS:

- pedir consentimiento o base autorizada;
- informar finalidad;
- permitir trazabilidad;
- evitar exposición pública;
- proteger descargas;
- limitar acceso;
- controlar retención;
- registrar quién accede o descarga;
- evitar subir imágenes innecesarias de terceros;
- difuminar o restringir datos sensibles si aplica.

### 9.4 Documentos mínimos recomendados

Crear o actualizar plantillas:

```txt
docs/legal/POLITICA_TRATAMIENTO_DATOS_PERSONALES_CERMONT_DRAFT.md
docs/legal/AVISO_PRIVACIDAD_CERMONT_DRAFT.md
docs/legal/AUTORIZACION_TRATAMIENTO_DATOS_TRABAJADORES_CONTRATISTAS_DRAFT.md
docs/legal/AUTORIZACION_USO_EVIDENCIAS_FOTOGRAFICAS_DRAFT.md
docs/legal/PROCEDIMIENTO_CONSULTAS_RECLAMOS_DATOS_PERSONALES_DRAFT.md
docs/legal/PROCEDIMIENTO_INCIDENTES_SEGURIDAD_DATOS_DRAFT.md
```

Marcar claramente como:

```txt
BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.
```

---

## 10. Fase 7 — Auditoría SSL/HTTPS y despliegue

Revisa si producción está correctamente configurada para HTTPS.

Busca:

- dominio configurado;
- `NEXT_PUBLIC_API_URL`;
- `API_URL`;
- `BACKEND_URL`;
- variables de entorno;
- proxy reverso;
- Nginx/Caddy/Apache;
- Docker Compose;
- certificados Let's Encrypt;
- Certbot;
- puertos 80 y 443;
- redirección HTTP → HTTPS;
- HSTS;
- cookies seguras;
- CORS;
- mixed content;
- WebSocket, si aplica;
- uploads bajo HTTPS;
- headers de seguridad.

Genera:

```txt
docs/deployment/SSL_HTTPS_AUDIT.md
docs/deployment/PRODUCTION_DEPLOYMENT_CHECKLIST.md
```

### Checks mínimos

1. ¿El frontend carga por HTTPS?
2. ¿La API responde por HTTPS?
3. ¿HTTP redirige a HTTPS?
4. ¿Hay certificado válido?
5. ¿El certificado no está vencido?
6. ¿Cookies usan `Secure`, `HttpOnly`, `SameSite`?
7. ¿CORS acepta solo dominios permitidos?
8. ¿No hay mixed content?
9. ¿Uploads y descargas usan HTTPS?
10. ¿HSTS está habilitado en producción?
11. ¿Las variables de entorno no apuntan a localhost?
12. ¿No hay secretos en repo?
13. ¿Existe renovación automática del certificado?
14. ¿Existe documentación para renovar/verificar SSL?

Si no tienes acceso al servidor, crea comandos para que el usuario ejecute:

```bash
curl -I https://DOMINIO
curl -I http://DOMINIO
openssl s_client -connect DOMINIO:443 -servername DOMINIO
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
docker compose ps
docker compose logs --tail=200
```

---

## 11. Fase 8 — Seguridad técnica

Genera:

```txt
docs/security/SECURITY_AUDIT.md
docs/security/OWASP_ASVS_BACKLOG.md
```

Revisar:

- auth;
- sesiones;
- JWT;
- cookies;
- password hashing;
- rate limiting;
- Helmet;
- CORS;
- input validation;
- file upload security;
- path traversal;
- SSRF;
- XSS;
- CSRF;
- IDOR;
- RBAC real en backend;
- logs sin secretos;
- backups;
- auditoría;
- manejo de errores;
- dependencia vulnerables;
- `.env` expuestos;
- permisos de archivos;
- endpoints administrativos.

---

## 12. Fase 9 — Estado real del desarrollo

Actualizar documentación del estado de la app.

Generar:

```txt
docs/DEVELOPMENT_STATUS.md
docs/ROADMAP.md
docs/CHANGELOG.md
docs/API_STATUS.md
docs/KNOWN_ISSUES.md
docs/TECHNICAL_DEBT.md
```

### `DEVELOPMENT_STATUS.md` debe incluir:

| Módulo | Estado | Frontend | Backend | Contrato | Tests | Documentación | Observaciones |
|---|---|---|---|---|---|---|---|

Estados permitidos:

- `done`
- `partial`
- `frontend-only`
- `backend-only`
- `mocked`
- `broken`
- `not-started`
- `needs-audit`

### Módulos a evaluar

- Auth;
- Usuarios;
- Roles/RBAC;
- Dashboard/KPIs;
- Órdenes;
- Solicitudes;
- Visitas;
- Propuestas;
- Planeación;
- Recursos;
- Herramientas;
- Vehículos;
- Evidencias;
- Cámara;
- Documentos/PDF;
- Checklists;
- Mantenimiento;
- Informes;
- Actas;
- SES;
- Facturación;
- Pagos;
- Notificaciones;
- Offline/PWA;
- Auditoría;
- Legal/privacidad;
- SSL/deploy.

---

## 13. Fase 10 — Implementación de ajustes

Después de tener auditoría y plan aprobado, implementar solo cambios seguros y priorizados.

### Prioridad 1 — Correcciones críticas

- frontend llama endpoints inexistentes;
- backend endpoints sin validación;
- contratos incompatibles;
- errores de build/typecheck;
- API URL mal configurada;
- fallas de auth/RBAC;
- datos sensibles expuestos;
- HTTP en producción;
- archivos sin validación.

### Prioridad 2 — Consistencia

- mover direct fetch a API services;
- centralizar query keys;
- alinear schemas;
- crear tests de contrato;
- documentar endpoints;
- corregir mocks no marcados.

### Prioridad 3 — Profesionalización

- OpenAPI detectado/generado;
- documentación actualizada;
- checklist SSL;
- checklist legal;
- roadmap técnico;
- tablero de deuda técnica.

---

## 14. Pruebas obligatorias

Ejecuta o documenta:

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm test
npm run test:integration
npm run test:e2e
npm audit
```

Si los scripts no existen, documenta la ausencia y propone scripts.

Agregar pruebas para:

- contratos API;
- rutas backend;
- consumo frontend;
- RBAC;
- HTTPS config cuando aplique;
- upload/files si aplica;
- dashboard data loading;
- error states;
- datos mock vs reales.

---

## 15. Entregables finales

Al finalizar, entrega un resumen con:

1. Estado general de la app.
2. Endpoints backend encontrados.
3. Endpoints frontend consumidos.
4. Endpoints huérfanos.
5. Llamadas frontend rotas.
6. Contratos incompatibles.
7. Módulos que siguen en mock.
8. Riesgos legales.
9. Riesgos SSL/HTTPS.
10. Riesgos de seguridad.
11. Documentación actualizada.
12. Tareas generadas por Spec Kit.
13. Comandos ejecutados.
14. Resultados de pruebas.
15. Recomendaciones siguientes.

---

## 16. Criterios de aceptación

La auditoría e implementación solo se considera terminada si:

1. Existe inventario backend.
2. Existe inventario frontend.
3. Existe matriz frontend-backend.
4. Existe auditoría de contratos.
5. Existe auditoría legal Colombia.
6. Existe auditoría SSL/HTTPS.
7. Existe auditoría de seguridad.
8. Existe estado actualizado de desarrollo.
9. Existe roadmap.
10. Existen specs, plan y tasks en formato Spec Kit.
11. Se identificaron endpoints no consumidos.
12. Se identificaron llamadas frontend rotas.
13. Se documentó si el frontend usa mocks.
14. Se documentó si los contratos se cumplen o no.
15. Se documentó si HTTPS está correcto o qué falta.
16. Se documentó qué falta para reducir riesgo de multa por protección de datos.
17. No se rompió funcionalidad existente.
18. No se introdujo `any`.
19. No se eliminaron endpoints sin deprecación.
20. Todo ajuste queda documentado.

---

## 17. Respuesta esperada del agente

Quiero que respondas en este formato:

```txt
# Auditoría CERMONT — Resultado inicial

## 1. Resumen ejecutivo
...

## 2. Evidencia encontrada
...

## 3. Matriz de endpoints
...

## 4. Estado de contratos
...

## 5. Estado legal y privacidad
...

## 6. Estado SSL/HTTPS
...

## 7. Documentación actualizada
...

## 8. Spec Kit artifacts creados
...

## 9. Tareas prioritarias
...

## 10. Comandos ejecutados y resultados
...
```

No adivines. Si algo no se puede verificar porque falta acceso al servidor, dominio, variables o repo, dilo claramente y deja comandos exactos para verificarlo.

No hagas cambios masivos antes de terminar la auditoría.
