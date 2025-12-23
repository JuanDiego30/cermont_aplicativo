/**
 * Value Object: CalculationFormula
 * 
 * Fórmula matemática para campos calculados
 */

import { ValidationError } from '../../../../common/domain/exceptions';

export class CalculationFormula {
  private constructor(private readonly _formula: string) {
    Object.freeze(this);
  }

  public static create(formula: string): CalculationFormula {
    CalculationFormula.validate(formula);
    return new CalculationFormula(formula.trim());
  }

  private static validate(formula: string): void {
    if (!formula || formula.trim() === '') {
      throw new ValidationError('Formula cannot be empty');
    }

    // Validar sintaxis básica: permitir números, operadores, paréntesis, nombres de campos
    const validPattern = /^[\d\s+\-*/().a-zA-Z_]+$/;
    if (!validPattern.test(formula)) {
      throw new ValidationError('Invalid formula syntax. Only numbers, operators, parentheses, and field names are allowed');
    }

    // Validar paréntesis balanceados
    let count = 0;
    for (const char of formula) {
      if (char === '(') count++;
      if (char === ')') count--;
      if (count < 0) {
        throw new ValidationError('Unbalanced parentheses in formula');
      }
    }
    if (count !== 0) {
      throw new ValidationError('Unbalanced parentheses in formula');
    }
  }

  public isValid(): boolean {
    try {
      // Intentar parsear fórmula básica
      const testExpression = this._formula.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, '1');
      // eslint-disable-next-line no-eval
      const result = eval(testExpression);
      return typeof result === 'number' && !isNaN(result);
    } catch {
      return false;
    }
  }

  public getReferencedFields(): string[] {
    // Extraer nombres de campos referenciados en fórmula
    // Ej: "field1 + field2 * 100" → ['field1', 'field2']
    const matches = this._formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
    return matches ? [...new Set(matches)] : [];
  }

  public getFormula(): string {
    return this._formula;
  }

  public equals(other: CalculationFormula): boolean {
    return this._formula === other._formula;
  }

  public toString(): string {
    return this._formula;
  }
}

