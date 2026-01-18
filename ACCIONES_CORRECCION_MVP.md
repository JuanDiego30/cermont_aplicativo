# 🎯 ACCIONES DE CORRECCIÓN INMEDIATA - MVP TESIS

**Modo:** Líder Técnico Pragmático  
**Objetivo:** Graduarse con software funcional, no ganar concurso de arquitectura  
**Fecha:** 2025

---

## ✅ ESTADO DE IMPLEMENTACIÓN

| Acción | Descripción                           | Estado        | Tiempo Real |
| ------ | ------------------------------------- | ------------- | ----------- |
| 1      | Templates de Inspección Pre-cargados  | ✅ COMPLETADO | 30 min      |
| 2      | Endpoint Simplificado de Llenado      | ✅ COMPLETADO | 15 min      |
| 3      | Generación PDF desde Formulario Lleno | ✅ COMPLETADO | 45 min      |
| 4      | Verificar Docker Compose              | ✅ LISTO      | N/A         |
| 5      | Test de humo Offline (Workbox)        | ⏳ PENDIENTE  | -           |

---

## 📊 DIAGNÓSTICO DE SOBRE-INGENIERÍA

### ¿Es necesario CQRS para este proyecto?

**RESPUESTA: NO**

| Criterio                     | Realidad CERMONT            | Veredicto            |
| ---------------------------- | --------------------------- | -------------------- |
| Concurrencia                 | ~5 usuarios simultáneos máx | ❌ No justifica CQRS |
| Volumen                      | 10-15 OTs/mes               | ❌ Trivial           |
| Separación lectura/escritura | No hay diferentes modelos   | ❌ Innecesario       |
| Event Sourcing               | No requerido                | ❌ Overkill          |

**ACCIÓN:** Mantener la estructura CQRS existente como scaffolding pero **NO AGREGAR MÁS COMPLEJIDAD**. El patrón `Controller → Service → Prisma` es suficiente para los formularios de inspección.

### Estado Actual del Módulo `forms/`

✅ **YA IMPLEMENTADO:**

- `FormsService` con CRUD completo de templates
- `FormParserService` para parsear PDF/Excel a templates
- Modelo `FormTemplate` + `FormularioInstancia` en Prisma
- Sistema de schema JSON flexible

⚠️ **FALTA para soportar los PDFs de inspección:**

1. **Templates pre-cargados** para Arnés, Escaleras, Pulidora, CCTV, Líneas de Vida
2. **UI de llenado** en Angular con checkboxes B/R/M
3. **Generación de PDF** desde datos llenos (no solo parsing)

---

## 🔧 PLAN DE CORRECCIÓN (5 Acciones Prioritarias)

### ACCIÓN 1: Crear Templates de Inspección Pre-cargados

**Archivo:** `backend/prisma/seeds/form-templates.ts`

Los PDFs subidos tienen esta estructura común:

- Tabla de items con columnas B (Bueno), R (Regular), M (Malo)
- Observaciones por item
- Firma del responsable
- Fecha de inspección

**Schema JSON propuesto:**

```json
{
  "sections": [
    {
      "title": "Identificación",
      "fields": [
        { "name": "fecha", "type": "date", "required": true },
        { "name": "responsable", "type": "text", "required": true },
        { "name": "equipo_id", "type": "text", "required": true }
      ]
    },
    {
      "title": "Inspección",
      "type": "matrix",
      "options": ["B", "R", "M", "NA"],
      "items": [
        { "code": "1.1", "description": "Correas sin desgaste" },
        { "code": "1.2", "description": "Hebillas funcionando" }
      ]
    },
    {
      "title": "Observaciones",
      "fields": [{ "name": "observaciones", "type": "textarea" }]
    }
  ]
}
```

**Esfuerzo:** 4 horas

---

### ACCIÓN 2: Simplificar el Flujo de Llenado de Formularios

**Patrón recomendado:** `Controller → Service → Prisma` (sin CQRS adicional)

Crear endpoint simple:

```typescript
// POST /api/forms/instances/:templateId/fill
@Post('instances/:templateId/fill')
async fillForm(
  @Param('templateId') templateId: string,
  @Body() data: Record<string, any>,
  @CurrentUser() user: User
) {
  return this.formsService.submitForm({
    templateId,
    ordenId: data.ordenId,
    data: data.responses,
    estado: 'completado'
  }, user.id);
}
```

**Esfuerzo:** 2 horas

---

### ACCIÓN 3: Generar PDF desde Formulario Lleno

**Usar:** `@react-pdf/renderer` o `pdfmake` (ya hay `pdf-generation/` module)

Crear servicio:

```typescript
// backend/src/modules/pdf-generation/services/form-pdf.service.ts
@Injectable()
export class FormPdfService {
  async generateInspectionPdf(instanceId: string): Promise<Buffer> {
    const instance = await this.prisma.formularioInstancia.findUnique({
      where: { id: instanceId },
      include: { template: true, completadoPor: true },
    });

    // Usar template.schema + instance.data para generar PDF
    return this.pdfGenerator.generate({
      title: instance.template.nombre,
      sections: this.mapDataToSections(instance),
    });
  }
}
```

**Esfuerzo:** 6 horas

---

### ACCIÓN 4: Verificar Docker Compose para VPS Contabo

**Estado actual:** ✅ LISTO

| Componente          | Estado | Notas                     |
| ------------------- | ------ | ------------------------- |
| PostgreSQL 16       | ✅     | Con healthcheck           |
| Backend NestJS      | ✅     | Puerto 3001 interno       |
| Frontend Angular    | ✅     | Servido por nginx interno |
| Nginx Reverse Proxy | ✅     | Rate limiting incluido    |
| SSL/Certbot         | ✅     | Listo para Let's Encrypt  |
| `.env.example`      | ✅     | Variables documentadas    |

**Única mejora necesaria:** Agregar redirección HTTP→HTTPS en nginx.conf

```nginx
# En server block puerto 80, agregar:
location / {
    return 301 https://$host$request_uri;
}
```

**Esfuerzo:** 30 minutos

---

### ACCIÓN 5: Crear Seed Script con Datos Demo

**Archivo:** `backend/prisma/seeds/demo-data.ts`

```typescript
// 1. Usuario Coordinador + Técnico
// 2. Cliente SIERRACOL
// 3. 5 Templates de formularios (Arnés, Escaleras, etc.)
// 4. 10 Órdenes de trabajo en diferentes estados
// 5. 3 Formularios llenos de ejemplo
```

**Esfuerzo:** 3 horas

---

## 📚 REPOS DE REFERENCIA (BENCHMARK REALISTA)

### 1. **idurar/idurar-erp-crm** (NestJS + React)

- **URL:** https://github.com/idurar/idurar-erp-crm
- **Qué copiar:**
  - Patrón `Controller → Service → Model` simple
  - Generación de PDFs (invoices)
  - Sistema de permisos por roles

### 2. **ever-co/ever-gauzy** (NestJS + Angular)

- **URL:** https://github.com/ever-co/ever-gauzy
- **Qué copiar:**
  - Módulo de equipos/assets
  - Time tracking (similar a registro de horas en OT)
  - Dashboard con KPIs

### 3. **notifirehq/notifire** (NestJS)

- **URL:** https://github.com/novuhq/novu (antes notifire)
- **Qué copiar:**
  - Patrones de workflows simples
  - Manejo de templates dinámicos

### Patrones Simples a Adoptar:

```typescript
// PATRÓN 1: Controller → Service → Prisma (SIN CQRS)
@Controller('inspections')
export class InspectionsController {
  constructor(private inspectionService: InspectionService) {}

  @Post()
  create(@Body() dto: CreateInspectionDto) {
    return this.inspectionService.create(dto);
  }
}

// PATRÓN 2: Generación PDF con pdfmake
import * as pdfMake from 'pdfmake/build/pdfmake';
const docDefinition = {
  content: [{ text: 'INSPECCIÓN DE ARNÉS', style: 'header' }, { table: { body: matrixData } }],
};
```

---

## 📋 CHECKLIST DE ENTREGABLES MVP

### Semana 1: Formularios de Inspección

- [ ] Crear 5 templates JSON (Arnés, Escaleras, Pulidora, CCTV, Líneas Vida)
- [ ] Endpoint `POST /api/forms/fill` funcionando
- [ ] Vista Angular básica con matriz de checkboxes B/R/M
- [ ] Botón "Guardar" que persiste en DB

### Semana 2: Generación de PDFs

- [ ] Servicio que genera PDF desde formulario lleno
- [ ] PDF con logo CERMONT, tabla de inspección, firma
- [ ] Endpoint `GET /api/forms/:id/pdf` que descarga PDF
- [ ] Vista Angular con botón "Descargar PDF"

### Semana 3: Deploy + Piloto

- [ ] VPS Contabo funcionando (docker-compose up)
- [ ] HTTPS con Let's Encrypt
- [ ] 5 usuarios creados (Coordinador + 4 Técnicos)
- [ ] 10 OTs de prueba ejecutadas
- [ ] Screenshots para tesis

---

## ⏱️ ESTIMACIÓN TOTAL

| Tarea                     | Horas          |
| ------------------------- | -------------- |
| Templates de inspección   | 4h             |
| Endpoint de llenado       | 2h             |
| Generación PDF            | 6h             |
| Fix nginx SSL             | 0.5h           |
| Seed script               | 3h             |
| Vista Angular formularios | 8h             |
| Deploy VPS                | 4h             |
| Pruebas piloto            | 6h             |
| **TOTAL**                 | **33.5 horas** |

**Ritmo realista:** 4h/día → **8-9 días de trabajo**

---

## 🚫 LO QUE NO HACER

1. ❌ NO agregar más capas de abstracción (CQRS handlers, etc.)
2. ❌ NO implementar Event Sourcing
3. ❌ NO crear microservicios separados
4. ❌ NO optimizar prematuramente (caching, Redis, etc.)
5. ❌ NO integrar SAP Ariba real (simular con botón manual)
6. ❌ NO desarrollar app móvil nativa (PWA es suficiente)

---

## ✅ PRÓXIMO PASO INMEDIATO

**Ejecutar ahora:**

```bash
# 1. Crear archivo de seed con templates de formularios
# 2. Probar que el módulo forms/ puede recibir y guardar inspecciones
# 3. Verificar que Angular puede mostrar un formulario básico
```

**¿Quieres que implemente la Acción 1 (crear templates de inspección pre-cargados)?**
