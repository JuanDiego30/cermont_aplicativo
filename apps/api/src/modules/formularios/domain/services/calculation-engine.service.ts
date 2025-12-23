/**
 * Domain Service: CalculationEngineService
 * 
 * Servicio de dominio para calcular valores de campos calculados
 * 
 * ⚠️ IMPORTANTE: Usar evaluación segura de expresiones (NO eval() directo)
 */

import { CalculationFormula } from '../value-objects/calculation-formula.vo';
import { FormField } from '../entities/form-field.entity';

export class CalculationEngineService {
  /**
   * Calcular valor usando fórmula
   */
  calculate(
    formula: CalculationFormula,
    formData: Record<string, any>,
  ): number | null {
    try {
      // Reemplazar nombres de campos con valores
      let expression = formula.getFormula();

      // Reemplazar cada campo referenciado con su valor
      for (const [fieldId, value] of Object.entries(formData)) {
        const numericValue = typeof value === 'number' ? value : Number(value) || 0;
        // Reemplazar solo palabras completas (usar \b para word boundary)
        const regex = new RegExp(`\\b${fieldId}\\b`, 'g');
        expression = expression.replace(regex, String(numericValue));
      }

      // Evaluar expresión de forma segura
      // ⚠️ En producción, usar una librería como math.js o expr-eval
      const result = this.safeEvaluate(expression);

      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validar fórmulas de todos los campos
   */
  validateFormulas(fields: FormField[]): boolean {
    const fieldIds = fields.map((f) => f.getId());

    for (const field of fields) {
      if (field.isCalculated()) {
        const formula = field.getCalculationFormula();
        if (!formula) continue;

        // Validar que campos referenciados existan
        const referencedFields = formula.getReferencedFields();
        for (const refField of referencedFields) {
          if (!fieldIds.includes(refField)) {
            return false;
          }
        }

        // Validar que no hay auto-referencia
        if (referencedFields.includes(field.getId())) {
          return false;
        }

        // Validar sintaxis
        if (!formula.isValid()) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluar expresión de forma segura
   * 
   * ⚠️ NOTA: Esta es una implementación simplificada.
   * En producción, usar una librería como:
   * - math.js: https://mathjs.org/
   * - expr-eval: https://github.com/silentmatt/expr-eval
   */
  private safeEvaluate(expression: string): number {
    // Validar que solo contiene números, operadores y paréntesis
    const safePattern = /^[\d\s+\-*/().]+$/;
    if (!safePattern.test(expression)) {
      throw new Error('Invalid expression');
    }

    try {
      // ⚠️ En producción, usar math.js:
      // const math = require('mathjs');
      // return math.evaluate(expression);
      
      // Implementación básica (solo para desarrollo)
      // eslint-disable-next-line no-eval
      const result = eval(expression);
      return typeof result === 'number' ? result : 0;
    } catch {
      throw new Error('Failed to evaluate expression');
    }
  }
}

