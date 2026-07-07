# 02 — Plan: formularios abiertos y selectores custom

## Problema

Los formularios o selectores cerrados no sirven para CERMONT porque la empresa es contratista multiservicio. Cada cliente, contrato, frente de trabajo o actividad puede requerir opciones no previstas.

## Objetivo

Permitir que cualquier selector crítico pueda aceptar opciones personalizadas sin romper validación, trazabilidad ni catálogos.

## Campos afectados

Aplicar a:

- tipo de actividad;
- tipo de servicio;
- herramientas;
- equipos;
- materiales;
- certificaciones;
- AST;
- PTW;
- tipo de evidencia;
- causa de bloqueo;
- cliente/contrato/sede/frente;
- tipo de soporte de cierre;
- forma de pago o referencia administrativa.

## Contrato propuesto

```ts
export const CustomOptionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  value: z.string().min(1),
  createdBy: z.string(),
  createdAt: z.string(),
  source: z.enum(["user_custom", "document_extraction", "admin_catalog"]),
  status: z.enum(["draft", "approved", "rejected"]),
  targetCatalog: z.string().optional(),
});

export const OpenSelectAnswerSchema = z.object({
  selectedValues: z.array(z.string()).default([]),
  customValues: z.array(CustomOptionSchema).default([]),
  otherText: z.string().optional(),
});
```

## Backend

Crear o verificar endpoints:

```text
POST /api/custom-options
GET /api/custom-options?catalog=tools
PATCH /api/custom-options/:id/approve
PATCH /api/custom-options/:id/reject
POST /api/form-responses/:id/custom-options
```

## Frontend

Crear o refactorizar componentes:

```text
OpenSelectField
OpenMultiSelectField
OpenRadioField
CustomOptionInput
CustomOptionApprovalBadge
```

## Comportamiento esperado

1. Usuario abre formulario de planeación.
2. Campo “Herramientas requeridas”.
3. Selecciona “Otro”.
4. Escribe “Cortadora de plasma”.
5. El sistema guarda esa opción en la respuesta.
6. La opción queda pendiente de aprobación para catálogo.
7. El blocker de herramientas se resuelve si cumple cantidad/requisito.
8. La próxima OT puede sugerir esa herramienta si fue aprobada.

## Tests obligatorios

- Permite seleccionar opción predefinida.
- Permite escribir opción personalizada.
- No permite custom vacío.
- Guarda custom en respuesta.
- Permite aprobar custom para catálogo.
- Rechaza custom duplicado.
- Funciona en modo offline si aplica.
