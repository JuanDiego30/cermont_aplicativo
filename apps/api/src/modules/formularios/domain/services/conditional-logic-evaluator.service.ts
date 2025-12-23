/**
 * Domain Service: ConditionalLogicEvaluatorService
 * 
 * Servicio de dominio para evaluar lógica condicional en formularios
 */

import { FormField } from '../entities/form-field.entity';
import { ConditionalOperator } from '../value-objects/conditional-operator.vo';

export interface ConditionalLogicConfig {
  targetFieldId: string;
  operator: string;
  expectedValue: any;
  action: 'SHOW' | 'HIDE';
}

export class ConditionalLogicEvaluatorService {
  /**
   * Evaluar si un campo debe mostrarse según lógica condicional
   */
  evaluate(
    logic: ConditionalLogicConfig,
    formData: Record<string, any>,
  ): boolean {
    const actualValue = formData[logic.targetFieldId];
    const operator = ConditionalOperator.fromString(logic.operator);
    const result = operator.evaluate(actualValue, logic.expectedValue);

    return logic.action === 'SHOW' ? result : !result;
  }

  /**
   * Validar lógica condicional de todos los campos
   */
  validate(fields: FormField[]): boolean {
    const fieldIds = fields.map((f) => f.getId());

    for (const field of fields) {
      if (field.hasConditionalLogic()) {
        const logic = field.getConditionalLogic();
        if (!logic) continue;

        // Validar que targetFieldId existe
        if (!fieldIds.includes(logic.targetFieldId)) {
          return false;
        }

        // Validar que no hay auto-referencia
        if (logic.targetFieldId === field.getId()) {
          return false;
        }
      }
    }

    // Detectar ciclos en dependencias
    return !this.hasCycles(fields);
  }

  /**
   * Detectar ciclos en grafo de dependencias
   */
  private hasCycles(fields: FormField[]): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (fieldId: string): boolean => {
      if (recStack.has(fieldId)) {
        return true; // Ciclo detectado
      }

      if (visited.has(fieldId)) {
        return false;
      }

      visited.add(fieldId);
      recStack.add(fieldId);

      const field = fields.find((f) => f.getId() === fieldId);
      if (field?.hasConditionalLogic()) {
        const logic = field.getConditionalLogic();
        if (logic) {
          if (hasCycle(logic.targetFieldId)) {
            return true;
          }
        }
      }

      recStack.delete(fieldId);
      return false;
    };

    for (const field of fields) {
      if (!visited.has(field.getId())) {
        if (hasCycle(field.getId())) {
          return true;
        }
      }
    }

    return false;
  }
}

