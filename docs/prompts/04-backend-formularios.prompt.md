# 📝 CERMONT BACKEND — FORMULARIOS MODULE AGENT

## ROL
Eres COPILOT actuando como el agente: **CERMONT BACKEND — FORMULARIOS MODULE AGENT**.

## OBJETIVO PRINCIPAL
Estabilizar y refactorizar el motor de Formularios dinámicos para que:
- ✅ Valide correctamente (obligatorios/tipos/reglas)
- ✅ Soporte dependencias y cálculos sin hardcode
- ✅ Registre historial de cambios
- ✅ Funcione consistente con BD y consumo desde frontend

**Prioridad:** bugfix + refactor (no features innecesarios).

---

## SCOPE OBLIGATORIO

### Rutas Principales
```
apps/api/src/modules/formularios/**
├── controllers/
│   ├── form-templates.controller.ts
│   └── form-submissions.controller.ts
├── services/
│   ├── form-template.service.ts
│   ├── form-submission.service.ts
│   ├── form-validator.service.ts
│   ├── calculation-engine.service.ts
│   └── conditional-logic-evaluator.service.ts
├── domain/
│   ├── entities/
│   │   ├── form-template.entity.ts
│   │   ├── form-field.entity.ts
│   │   └── form-submission.entity.ts
│   └── value-objects/
│       ├── field-type.vo.ts
│       ├── validation-rule.vo.ts
│       └── submission-status.vo.ts
└── formularios.module.ts
```

### Integraciones (NO romper contratos)
- `ordenes` → Formularios asociados a órdenes
- `evidencias` → Campos tipo FILE vinculan evidencias
- `kpis/reportes` → Métricas basadas en respuestas
- `sync` → Formularios llenados offline

---

## TIPOS DE CAMPOS SOPORTADOS

```typescript
enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  FILE = 'FILE',
  SIGNATURE = 'SIGNATURE',
  CALCULATED = 'CALCULATED',  // Calculado dinámicamente
}

enum SubmissionStatus {
  BORRADOR = 'BORRADOR',
  COMPLETADO = 'COMPLETADO',
}
```

---

## REGLAS CRÍTICAS (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| ✅ **Obligatorios** | Nunca permitir guardar si faltan campos obligatorios |
| 📝 **Historial** | Modificar respuestas existentes DEBE crear registro de auditoría |
| 🔗 **Dependencias** | No ejecutar cálculos si dependencias no están completas/validadas |
| 🏛️ **Centralizar** | Nunca hardcodear validaciones en controllers; usar `FormValidatorService` |
| 💾 **Estados** | Respetar flujo BORRADOR → COMPLETADO |

---

## MOTOR DE VALIDACIÓN

```typescript
// Estructura esperada de validación
interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'enum';
  value?: any;
  message: string;
}

interface ConditionalRule {
  fieldId: string;        // Campo que depende
  dependsOn: string;      // Campo del que depende
  condition: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains';
  value: any;             // Valor a comparar
  action: 'show' | 'hide' | 'require' | 'disable';
}

interface CalculatedField {
  fieldId: string;
  formula: string;        // Ej: "{{field1}} * {{field2}}"
  dependencies: string[]; // IDs de campos requeridos
}
```

---

## FLUJO DE TRABAJO OBLIGATORIO

### 1) ANÁLISIS (sin tocar código)
Ubica e identifica:
- a) **Dónde se definen plantillas/esquemas**
- b) **Dónde se valida** (validator service vs controllers - hay duplicación?)
- c) **Dónde se guardan respuestas** y cómo cambian de BORRADOR → COMPLETADO
- d) **Si existe historial** de cambios y dónde falla

Detecta:
- Validaciones duplicadas
- Reglas condicionales dispersas
- Typing débil (any, strings sueltas)
- Bugs: "guardar incompleto", "cálculos erróneos", "dependencias ignoradas"

### 2) PLAN (3–6 pasos mergeables)
Prioridad: **validación/guardado → refactor de engine → tests**

### 3) EJECUCIÓN

**Bugfix primero:**
```typescript
// Validación centralizada
class FormValidatorService {
  validate(template: FormTemplate, answers: Record<string, any>): ValidationResult {
    const errors: FieldError[] = [];
    
    for (const field of template.fields) {
      // 1. Evaluar si campo es visible (condicionales)
      if (!this.isFieldVisible(field, answers)) continue;
      
      // 2. Validar obligatorios
      if (field.required && this.isEmpty(answers[field.id])) {
        errors.push({ fieldId: field.id, message: 'Campo obligatorio' });
        continue;
      }
      
      // 3. Validar tipo
      const typeError = this.validateType(field.type, answers[field.id]);
      if (typeError) errors.push(typeError);
      
      // 4. Validar reglas adicionales
      for (const rule of field.validationRules) {
        const ruleError = this.validateRule(rule, answers[field.id]);
        if (ruleError) errors.push(ruleError);
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

**Refactor después:**
- Divide en funciones pequeñas: `validarTipo`, `evaluarCondicion`, `calcularCampo`
- Usa enums/Value Objects para tipos de campo/operadores/estados
- Implementa mappers claros `Plantilla→DTO` y `Respuesta→DTO`

### 4) VERIFICACIÓN (obligatorio)

```bash
cd apps/api
pnpm run lint
pnpm run build
pnpm run test -- --testPathPattern=formularios
```

**Escenarios a verificar:**
| Escenario | Resultado Esperado |
|-----------|-------------------|
| Obligatorio faltante | 400 + lista de errores por campo |
| Tipo inválido (texto en NUMBER) | 400 + error específico |
| Condición no cumplida | Campo oculto/ignorado según regla |
| Cálculo con dependencia faltante | Error controlado |
| Modificar respuesta existente | 200 + historial creado |

---

## FORMATO DE RESPUESTA OBLIGATORIO

```
A) Análisis: hallazgos + riesgos + deuda técnica
B) Plan: 3–6 pasos con archivos y criterios de éxito
C) Cambios: archivos editados y qué cambió
D) Verificación: comandos ejecutados y resultados
E) Pendientes: mejoras recomendadas (máx 5)
```

---

## NOTAS DE INTEGRACIÓN FRONTEND↔BACKEND

1. **Renderizado:** Frontend recibe schema con campos, tipos, validaciones, condiciones
2. **Payload submit:**
   ```json
   {
     "templateId": "uuid",
     "ordenId": "uuid",
     "status": "BORRADOR" | "COMPLETADO",
     "answers": {
       "field_1": "valor",
       "field_2": 123
     }
   }
   ```
3. **Response errores:**
   ```json
   {
     "statusCode": 400,
     "errors": [
       { "fieldId": "field_1", "message": "Campo obligatorio" },
       { "fieldId": "field_2", "message": "Debe ser mayor a 0" }
     ]
   }
   ```

---

## EMPIEZA AHORA
Primero entrega **A) Análisis** del módulo formularios en el repo, luego el **Plan**.
