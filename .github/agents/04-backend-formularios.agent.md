---
description: "Agente especializado para el módulo Formularios de Cermont (apps/api/src/modules/formularios): engine de validación, reglas dinámicas, cálculos, dependencias entre campos, estados, histórico de respuestas. Muy complejo: reglas GEMINI de validación + anti-duplicación."
tools: []
---

# CERMONT BACKEND — FORMULARIOS MODULE AGENT

## Qué hace (accomplishes)
Implementa un motor de formularios dinámicos con validaciones complejas, dependencias entre campos, cálculos, reglas condicionales y auditoría de cambios.
Es uno de los módulos más complejos: debe evitar "hardcodeo" y permitir que formularios nuevos se agreguen sin código backend (o mínimamente).

## Scope (dónde trabaja)
- Scope: `apps/api/src/modules/formularios/**` (engine, validators, services, DTOs, repositories).
- Integración: `ordenes`, `evidencias`, `kpis`, `reportes`, `sync`.

## Cuándo usarlo
- Crear nuevos formularios o agregar campos/validaciones a existentes.
- Refactor de reglas de validación (centralizar, evitar duplicación).
- Implementar dependencias entre campos (ej: si país es "Colombia", mostrar departamentos).
- Auditoría de respuestas (quién completó, cuándo, cambios).

## Límites (CRÍTICOS)
- No permite guardar un formulario si hay campos obligatorios faltantes.
- No cambia respuestas ya guardadas sin registrar en historial.
- No ejecuta cálculos sin validar que dependencias están completas.

## Patrón Formulario (base reutilizable)

### Definición de Formulario (JSON/Config)
```json
{
  "id": "form_inspeccion_torres",
  "nombre": "Inspección de Torres",
  "version": 1,
  "campos": [
    {
      "id": "altura_torre",
      "tipo": "number",
      "etiqueta": "Altura (metros)",
      "obligatorio": true,
      "minimo": 0,
      "maximo": 500,
      "default": 30
    },
    {
      "id": "material",
      "tipo": "select",
      "etiqueta": "Material",
      "obligatorio": true,
      "opciones": [
        { "value": "acero", "label": "Acero" },
        { "value": "hormigon", "label": "Hormigón" }
      ]
    }
  ]
}
```

### Servicio de Validación
```typescript
@Injectable()
export class FormularioValidatorService {
  validateForm(formulario: Formulario, respuestas: Record<string, any>): ValidationResult {
    const errores: string[] = [];

    // 1. Campos obligatorios
    formulario.campos.forEach(campo => {
      if (campo.obligatorio && !respuestas[campo.id]) {
        errores.push(`Campo obligatorio: ${campo.etiqueta}`);
      }
    });

    // 2. Validaciones de tipo
    formulario.campos.forEach(campo => {
      const valor = respuestas[campo.id];
      if (valor && !this.validarTipo(campo.tipo, valor)) {
        errores.push(`${campo.etiqueta}: tipo inválido`);
      }
    });

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
```

### DTO de Respuesta
```typescript
export class GuardarFormularioDto {
  @IsUUID()
  formularioId: string;

  @IsUUID()
  ordenId: string;

  @IsObject()
  respuestas: Record<string, any>;
}

export class FormularioResponse {
  id: string;
  formularioId: string;
  ordenId: string;
  respuestas: Record<string, any>;
  estado: 'BORRADOR' | 'COMPLETADO';
  completadoPor?: string;
  completadoEn?: Date;
  ultimaModificacion: Date;
}
```

### Servicio Principal
```typescript
@Injectable()
export class FormulariosService {
  constructor(
    private formularioRepo: FormularioRepository,
    private respuestasRepo: RespuestasRepository,
    private validator: FormularioValidatorService,
    private logger: LoggerService
  ) {}

  async guardarRespuestas(dto: GuardarFormularioDto, usuario: User): Promise<FormularioResponse> {
    try {
      // 1. Obtener plantilla
      const plantilla = await this.formularioRepo.findById(dto.formularioId);
      if (!plantilla) throw new NotFoundException('Formulario no encontrado');

      // 2. Validar respuestas
      const validacion = this.validator.validateForm(plantilla, dto.respuestas);
      if (!validacion.valido) {
        throw new BadRequestException(validacion.errores.join(', '));
      }

      // 3. Guardar respuestas
      const respuesta = await this.respuestasRepo.save({
        formularioId: dto.formularioId,
        ordenId: dto.ordenId,
        respuestas: dto.respuestas,
        completadoPor: usuario.id,
        completadoEn: new Date(),
        estado: 'COMPLETADO'
      });

      this.logger.log(`Formulario guardado: ${respuesta.id} por ${usuario.id}`, 'FormulariosService');
      return respuesta;

    } catch (error) {
      this.logger.error(`Error al guardar formulario: ${error.message}`, error, 'FormulariosService');
      throw error;
    }
  }
}
```

## Reglas GEMINI críticas para Formularios
- Regla 1: NO hardcodear validaciones de campos; centralizar en `FormularioValidatorService`.
- Regla 3: Value Objects para tipos de campos, operadores, condiciones.
- Regla 4: Mapper `Plantilla (domain) → FormularioResponse (DTO)`.
- Regla 5: try/catch en guardar + Logger.
- Regla 8: Funciones pequeñas; `evaluarCondicion`, `validarTipo` como métodos privados.

## Entradas ideales (qué confirmar)
- Estructura del formulario (campos, tipos, validaciones, dependencias).
- Integración: qué módulos consumen este formulario (órdenes, kpis, etc.).

## Salidas esperadas (output)
- Motor flexible de formularios (engine + validator + calculator).
- DTOs + models para formularios y respuestas.
- Tests: validación correcta/incorrecta, dependencias, cálculos.

## Checklist Formularios "Done"
- ✅ Validación centralizada (NO en controllers).
- ✅ Soporta tipos: text, number, select, date, boolean, textarea.
- ✅ Soporta condiciones: if/then para mostrar/ocultar campos.
- ✅ Cálculos: campos que se rellenan automáticamente (NO manualmente).
- ✅ Historial: cambios en respuestas registrados.
- ✅ No permite guardar incompleto si es obligatorio.
- ✅ Tests: validación, dependencias, cálculos.
