# Mapeo de Formatos Operativos a Schemas Zod

> **Fuente:** Formatos PDF originales en `.sisyphus/plans/` y `docs/pdf/`
> **Fecha:** 2026-07-09
> **Propósito:** Vincular cada campo de los formatos operativos de CERMONT con su schema Zod correspondiente

---

## Formato: Planeación de Obra

**Archivo fuente:** `06_FORMATO_DE_PLANEACION_DE_OBRA3.md`
**Schema Zod candidato:** `PlanningPacketSchema` en `packages/shared-types/src/schemas/planning-packet.schema.ts`

### Campos Identificados

| Campo en el Formato | Tipo de Dato | Obligatorio | Schema Zod Actual | Estado |
|---|---|---|---|---|
| Responsable de la inspección | texto | Sí | `planningPacketSchema.responsible` | PENDIENTE VERIFICAR |
| Lugar | texto | Sí | `planningPacketSchema.location` | PENDIENTE VERIFICAR |
| Fecha | fecha | Sí | `planningPacketSchema.date` | PENDIENTE VERIFICAR |
| Unidad de negocio | select (IT/MNT/SC/GEN/Otros) | Sí | `planningPacketSchema.businessUnit` | PENDIENTE VERIFICAR |
| Alcance | texto largo | Sí | `planningPacketSchema.scope` | PENDIENTE VERIFICAR |
| Materiales (descripción + cantidad) | tabla | Sí | `planningPacketSchema.materials` | PENDIENTE VERIFICAR |
| Herramientas (descripción + cantidad) | tabla | Sí | `planningPacketSchema.tools` | PENDIENTE VERIFICAR |
| Equipos (descripción + cantidad) | tabla | Sí | `planningPacketSchema.equipment` | PENDIENTE VERIFICAR |
| Elementos de seguridad (descripción + cantidad) | tabla | Sí | `planningPacketSchema.safetyElements` | PENDIENTE VERIFICAR |
| Número de electricistas | número | Sí | `planningPacketSchema.electricians` | PENDIENTE VERIFICAR |
| Técnicos en telecomunicación | número | Sí | `planningPacketSchema.telecomTechs` | PENDIENTE VERIFICAR |
| Instrumentistas | número | Sí | `planningPacketSchema.instrumentists` | PENDIENTE VERIFICAR |
| Obreros | número | Sí | `planningPacketSchema.workers` | PENDIENTE VERIFICAR |
| Firma Ing. Residente | firma | Sí | `planningPacketSchema.residentEngineerSignature` | PENDIENTE VERIFICAR |
| Firma Técnico Electricista | firma | Sí | `planningPacketSchema.electricianSignature` | PENDIENTE VERIFICAR |
| Firma HES | firma | Sí | `planningPacketSchema.heSSignature` | PENDIENTE VERIFICAR |

### Reglas de Negocio Observadas
- El alcance debe detallar las actividades específicas a ejecutar
- Los materiales, herramientas, equipos y elementos de seguridad deben relacionarse con cantidades
- La firma de los tres roles (Ing. Residente, Técnico, HES) es obligatoria

---

## Formato: Inspección Líneas de Vida Vertical

**Archivo fuente:** `08_Formato_Inspeccion_lineas_de_vida_Vertical3.md`
**Formato original:** OPE-006
**Schema Zod candidato:** [NO EXISTE — requiere creación] → `LifelineInspectionSchema`

### Campos Identificados

| Campo en el Formato | Tipo de Dato | Obligatorio | Schema Zod Actual | Estado |
|---|---|---|---|---|
| Tipo de línea de vida | texto (Vertical) | Sí | — | GAP |
| Fecha de instalación | fecha | Sí | — | GAP |
| Fecha de último mantenimiento | fecha | Sí | — | GAP |
| Concepto final | C/NC | Sí | — | GAP |

#### Componentes a Inspeccionar (C/NC por cada uno)
| Componente | Sub-condiciones | Estado Schema |
|---|---|---|
| Placa de anclaje superior | Grietas, Corrosión | GAP |
| Platinas de sujeción | Corrosión, Grietas, Tornillos, Ajuste | GAP |
| Absorbedor de energía | Corrosión, Grietas, Tornillos, Grafado | GAP |
| Sistema tensor | Corrosión, Grietas, Tornillos, Pin fijación, Grafado | GAP |
| Cable en acero inoxidable | Integridad, Torceduras, Aplastamientos, Hilos sueltos, Tensionado, Corrosión | GAP |
| Soporte cable guía | Corrosión, Grietas, Tornillos, Cada 10m | GAP |
| Placa de anclaje inferior | Grietas, Corrosión | GAP |
| Placa de identificación | Instalación, Legible, Fecha inspección | GAP |

#### Hoja de Vida (Componentes con cantidades)
| Componente | Referencia | Cantidad | Estado Schema |
|---|---|---|---|
| Soporte superior fijación escalera | 1 | 1 EA | GAP |
| Absorbedor energía tipo resorte | 2 | 1 EA | GAP |
| Línea guía altura máx anclaje superior | 3 | 1 EA | GAP |
| Barra grafado amortiguador cable | 4 | 1 EA | GAP |
| Anclaje superior paso escalera 1'' | 5 | 3 EA | GAP |
| Tornillo fijación paso escalera | 6 | 20 EA | GAP |
| Tuerca fijación paso escalera | 6 | 20 EA | GAP |
| Cable acero inoxidable 8mm L316 | 7 | 45 M | GAP |
| Cable guía | 8 | 3 EA | GAP |
| Soporte inferior fijación escalera | 10 | 1 EA | GAP |
| Anclaje inferior paso escalera 1'' | 11 | 2 EA | GAP |
| Tensor inferior fijación acero inox | 12 | 1 EA | GAP |

#### Registro Fotográfico Obligatorio
| Componente a fotografiar | Estado Schema |
|---|---|
| Placa de anclaje superior | GAP |
| Estructura de la torre (cambio de tornillo) | GAP |
| Placa de anclaje inferior | GAP |
| Soporte cable guía | GAP |
| Absorbedor de energía | GAP |

---

## Formato: Mantenimiento CCTV

**Archivo fuente:** `10_Formato_Mantenimiento_CCTV3.md`
**Schema Zod candidato:** [NO EXISTE — requiere creación] → `CCTVMaintenanceSchema`

### Campos Identificados

| Campo en el Formato | Tipo de Dato | Obligatorio | Schema Zod Actual | Estado |
|---|---|---|---|---|
| Cámara No | número | Sí | — | GAP |
| Rutina No | número | Sí | — | GAP |
| Lugar | texto | Sí | — | GAP |
| Fecha | fecha | Sí | — | GAP |
| Altura estructura | número | Sí | — | GAP |
| Distancia cámara - caja conexión | número | Sí | — | GAP |
| Altura cámara | número | Sí | — | GAP |
| Tipo de cámara | texto | Sí | — | GAP |
| Modelo | texto | Sí | — | GAP |
| Serial | texto | Sí | — | GAP |
| Encoder/POE - Modelo | texto | Sí | — | GAP |
| Encoder/POE - Serial | texto | Sí | — | GAP |
| Tipo de radio - Modelo | texto | Sí | — | GAP |
| Tipo de radio - Serial | texto | Sí | — | GAP |
| Antena externa - Tipo | texto | Sí | — | GAP |
| Antena externa - Serial | texto | Sí | — | GAP |
| Switch - Modelo | texto | Sí | — | GAP |
| Switch - Serial | texto | Sí | — | GAP |
| Ubicación | texto | Sí | — | GAP |
| Alimentación AC 110 VAC | checkbox (Sí/No) | Sí | — | GAP |
| Sistema fotovoltaico | checkbox (Sí/No) | Sí | — | GAP |
| Caja de conexión | checkbox (Sí/No) | Sí | — | GAP |
| Sistema eléctrico activo AC | checkbox (Sí/No) | Sí | — | GAP |
| Transferencia automática | checkbox (Sí/No) | Sí | — | GAP |
| Gabinete en base de torre | checkbox (Sí/No) | Sí | — | GAP |
| Alimentación proviene de TBT | texto | Sí | — | GAP |
| Luces de obstrucción | texto | Sí | — | GAP |
| Registro fotográfico: Cámara (antes/después) | imagen | Sí | — | GAP |
| Registro fotográfico: Radioenlace | imagen | Sí | — | GAP |
| Registro fotográfico: Caja conexiones CCTV | imagen | Sí | — | GAP |
| Registro fotográfico: Conexión eléctrica | imagen | Sí | — | GAP |
| Registro fotográfico: Sistema puesta a tierra | imagen | Sí | — | GAP |

---

## Formato: Registro Fotográfico — Anclaje Escalera a Estructura

**Archivo fuente:** `05_FOTOS_ANCLAJE_ESCALERA_A_ESTRUCTURA3.md`
**Schema Zod candidato:** `EvidenceSchema` (existente, verificar cobertura)

### Campos Identificados

| Componente a Fotografiar | Estado Schema |
|---|---|
| Anclaje peldaños escalera soporte superior | PENDIENTE VERIFICAR en `EvidenceSchema` |
| Estado tornillos, soldadura anclaje entre escalera y estructura (soporte superior) | PENDIENTE VERIFICAR |
| Anclaje peldaños escalera soporte superior a lo largo de la línea de vida | PENDIENTE VERIFICAR |
| Anclaje peldaños escalera soporte inferior | PENDIENTE VERIFICAR |
| Estado tornillos, soldadura anclaje entre escalera y estructura (soporte inferior) | PENDIENTE VERIFICAR |

---

## Resumen de Gaps

| Formato | Campos Totales | Campos Mapeados | Campos GAP | Cobertura |
|---|---|---|---|---|
| Planeación de Obra | 16 | 0 | 16 | 0% |
| Inspección Líneas de Vida | ~40 | 0 | ~40 | 0% |
| Mantenimiento CCTV | ~30 | 0 | ~30 | 0% |
| Registro Fotográfico (Anclaje) | 5 | 0 (PENDIENTE VERIFICAR) | 5 | 0% |

**Total de campos sin schema Zod:** ~91 (requieren verificación contra schemas existentes antes de crear nuevos)

**Recomendación:** Antes de crear schemas nuevos, verificar con:
```bash
Get-ChildItem -Path "packages/shared-types/src/schemas" -Name
```
Buscar si los campos ya existen en schemas como `InspectionSchema`, `ChecklistItemSchema`, `EvidenceSchema`, etc.
