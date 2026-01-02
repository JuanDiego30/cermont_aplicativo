/**
 * Entity: FormField
 * 
 * Representa un campo individual de un formulario
 * 
 * Invariantes:
 * - label no puede estar vacío
 * - Si el tipo requiere opciones, debe tener al menos una opción
 * - Validaciones deben ser válidas
 */

import { FieldType, FieldTypeEnum } from '../value-objects/field-type.vo';
import { FieldValue } from '../value-objects/field-value.vo';
import { ValidationRule, ValidationResult } from '../value-objects/validation-rule.vo';
import { CalculationFormula } from '../value-objects/calculation-formula.vo';
import { BusinessRuleViolationError } from '../exceptions';
import { ValidationError } from '../../../../common/domain/exceptions';
import { randomUUID } from 'crypto';
import { ConditionalLogicConfig } from '../services/conditional-logic-evaluator.service';

// Re-export para compatibilidad
export type { ConditionalLogicConfig };

export class FormField {
  private static readonly MIN_LABEL_LENGTH = 1;
  private static readonly MAX_LABEL_LENGTH = 200;

  private constructor(
    private readonly _id: string,
    private _type: FieldType,
    private _label: string,
    private _placeholder?: string,
    private _helpText?: string,
    private _defaultValue?: FieldValue,
    private _validations: ValidationRule[] = [],
    private _conditionalLogic?: ConditionalLogicConfig,
    private _calculationFormula?: CalculationFormula,
    private _options?: string[],
    private _order: number = 0,
    private _isRequired: boolean = false,
  ) {
    this.validate();
  }

  /**
   * Crear nuevo campo
   */
  public static create(props: {
    id?: string;
    type: FieldType;
    label: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: any;
    validations?: ValidationRule[];
    conditionalLogic?: ConditionalLogicConfig;
    calculationFormula?: CalculationFormula;
    options?: string[];
    order?: number;
    isRequired?: boolean;
  }): FormField {
    const id = props.id || randomUUID();

    // Validar label
    if (!props.label || props.label.trim().length < FormField.MIN_LABEL_LENGTH) {
      throw new ValidationError(
        `Label debe tener al menos ${FormField.MIN_LABEL_LENGTH} caracteres`,
        'label',
      );
    }
    if (props.label.length > FormField.MAX_LABEL_LENGTH) {
      throw new ValidationError(
        `Label no puede exceder ${FormField.MAX_LABEL_LENGTH} caracteres`,
        'label',
      );
    }

    // Validar que campos que requieren opciones tengan opciones
    if (props.type.requiresOptions() && (!props.options || props.options.length === 0)) {
      throw new ValidationError(
        `Field type ${props.type.getValue()} requires at least one option`,
        'options',
      );
    }

    const defaultValue = props.defaultValue !== undefined
      ? FieldValue.create(props.defaultValue)
      : undefined;

    return new FormField(
      id,
      props.type,
      props.label.trim(),
      props.placeholder?.trim(),
      props.helpText?.trim(),
      defaultValue,
      props.validations || [],
      props.conditionalLogic,
      props.calculationFormula,
      props.options,
      props.order || 0,
      props.isRequired || false,
    );
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: any;
    validations?: any[];
    conditionalLogic?: ConditionalLogicConfig;
    calculationFormula?: string;
    options?: string[];
    order?: number;
    isRequired?: boolean;
  }): FormField {
    const type = FieldType.fromString(props.type);
    const defaultValue = props.defaultValue !== undefined
      ? FieldValue.create(props.defaultValue)
      : undefined;

    const validations = (props.validations || [])
      .map((v: any) => {
        // Reconstruir ValidationRule desde persistencia
        // Mantenerlo tolerante a datos legacy
        switch (String(v?.type || '').toUpperCase()) {
          case 'REQUIRED':
            return ValidationRule.required();
          case 'MIN_LENGTH':
            return ValidationRule.minLength(Number(v.value));
          case 'MAX_LENGTH':
            return ValidationRule.maxLength(Number(v.value));
          case 'MIN_VALUE':
            return ValidationRule.minValue(Number(v.value));
          case 'MAX_VALUE':
            return ValidationRule.maxValue(Number(v.value));
          case 'EMAIL':
            return ValidationRule.email();
          case 'URL':
            return ValidationRule.url();
          case 'PATTERN': {
            // v.value puede venir como string (source) o como regex serializado legacy
            const patternSource = typeof v.value === 'string'
              ? v.value
              : (v.value?.source ?? String(v.value ?? ''));
            return ValidationRule.pattern(new RegExp(patternSource));
          }
          default:
            return null;
        }
      })
      .filter(Boolean) as ValidationRule[];

    const calculationFormula = props.calculationFormula
      ? CalculationFormula.create(props.calculationFormula)
      : undefined;

    return new FormField(
      props.id,
      type,
      props.label,
      props.placeholder,
      props.helpText,
      defaultValue,
      validations,
      props.conditionalLogic,
      calculationFormula,
      props.options,
      props.order || 0,
      props.isRequired || false,
    );
  }

  /**
   * Actualizar campo (inmutabilidad)
   */
  public update(updates: Partial<{
    label: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: any;
    validations?: ValidationRule[];
    conditionalLogic?: ConditionalLogicConfig;
    calculationFormula?: CalculationFormula;
    options?: string[];
    order?: number;
    isRequired?: boolean;
  }>): FormField {
    return FormField.create({
      id: this._id,
      type: this._type,
      label: updates.label ?? this._label,
      placeholder: updates.placeholder ?? this._placeholder,
      helpText: updates.helpText ?? this._helpText,
      defaultValue: updates.defaultValue ?? this._defaultValue?.getValue(),
      validations: updates.validations ?? this._validations,
      conditionalLogic: updates.conditionalLogic ?? this._conditionalLogic,
      calculationFormula: updates.calculationFormula ?? this._calculationFormula,
      options: updates.options ?? this._options,
      order: updates.order ?? this._order,
      isRequired: updates.isRequired ?? this._isRequired,
    });
  }

  /**
   * Clonar campo
   */
  public clone(): FormField {
    return FormField.create({
      type: this._type,
      label: this._label,
      placeholder: this._placeholder,
      helpText: this._helpText,
      defaultValue: this._defaultValue?.getValue(),
      validations: [...this._validations],
      conditionalLogic: this._conditionalLogic ? { ...this._conditionalLogic } : undefined,
      calculationFormula: this._calculationFormula,
      options: this._options ? [...this._options] : undefined,
      order: this._order,
      isRequired: this._isRequired,
    });
  }

  /**
   * Validar configuración del campo
   */
  public isValid(): boolean {
    // Validar que campos que requieren opciones tengan opciones
    if (this._type.requiresOptions() && (!this._options || this._options.length === 0)) {
      return false;
    }

    // Validar fórmula de cálculo si existe
    if (this._calculationFormula && !this._calculationFormula.isValid()) {
      return false;
    }

    return true;
  }

  /**
   * Validar valor del campo
   */
  public validateValue(value: any): ValidationResult {
    const fieldValue = FieldValue.create(value);

    // Validar tipo de dato
    if (!this._type.validateValue(fieldValue.getValue())) {
      return {
        isValid: false,
        error: `Invalid type. Expected ${this._type.getValue()}`,
      };
    }

    // Validar requerido
    if (this._isRequired && fieldValue.isEmpty()) {
      return {
        isValid: false,
        error: 'Field is required',
      };
    }

    // Validar reglas
    for (const validation of this._validations) {
      const result = validation.validate(fieldValue.getValue());
      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  }

  /**
   * Verificar si tiene lógica condicional
   */
  public hasConditionalLogic(): boolean {
    return this._conditionalLogic !== undefined;
  }

  /**
   * Verificar si es campo calculado
   */
  public isCalculated(): boolean {
    return this._calculationFormula !== undefined;
  }

  /**
   * Evaluar si el campo debe mostrarse según lógica condicional
   */
  public shouldDisplay(formData: Record<string, any>): boolean {
    if (!this._conditionalLogic) return true;

    const targetValue = formData[this._conditionalLogic.targetFieldId];
    // La evaluación real se hace en ConditionalLogicEvaluatorService
    // Esto es una simplificación
    return true;
  }

  /**
   * Calcular valor del campo
   */
  public calculateValue(formData: Record<string, any>): FieldValue | null {
    if (!this._calculationFormula) return null;

    // La evaluación real se hace en CalculationEngineService
    // Esto es una simplificación
    return null;
  }

  private validate(): void {
    if (!this._label || this._label.trim() === '') {
      throw new ValidationError('Field label is required', 'label');
    }

    if (this._type.requiresOptions() && (!this._options || this._options.length === 0)) {
      throw new ValidationError(
        `Field type ${this._type.getValue()} requires options`,
        'options',
      );
    }
  }

  // Getters
  public getId(): string {
    return this._id;
  }

  public getType(): FieldType {
    return this._type;
  }

  public getLabel(): string {
    return this._label;
  }

  public getPlaceholder(): string | undefined {
    return this._placeholder;
  }

  public getHelpText(): string | undefined {
    return this._helpText;
  }

  public getDefaultValue(): FieldValue | undefined {
    return this._defaultValue;
  }

  public getValidations(): ValidationRule[] {
    return [...this._validations];
  }

  public getConditionalLogic(): ConditionalLogicConfig | undefined {
    return this._conditionalLogic ? { ...this._conditionalLogic } : undefined;
  }

  public getCalculationFormula(): CalculationFormula | undefined {
    return this._calculationFormula;
  }

  public getOptions(): string[] | undefined {
    return this._options ? [...this._options] : undefined;
  }

  public getOrder(): number {
    return this._order;
  }

  public isRequired(): boolean {
    return this._isRequired;
  }

  /**
   * Convertir a objeto plano para persistencia
   */
  public toPersistence(): Record<string, any> {
    return {
      id: this._id,
      type: this._type.getValue(),
      label: this._label,
      placeholder: this._placeholder,
      helpText: this._helpText,
      defaultValue: this._defaultValue?.getValue(),
      validations: this._validations.map((v) => ({
        type: v.getType(),
        value: v.getType() === 'PATTERN' && v.getValue() instanceof RegExp
          ? v.getValue().source
          : v.getValue(),
      })),
      conditionalLogic: this._conditionalLogic,
      calculationFormula: this._calculationFormula?.getFormula(),
      options: this._options,
      order: this._order,
      isRequired: this._isRequired,
    };
  }
}

