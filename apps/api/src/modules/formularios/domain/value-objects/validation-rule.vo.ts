/**
 * Value Object: ValidationRule
 * 
 * Regla de validación para campos de formulario
 */

export enum ValidationRuleType {
  REQUIRED = 'REQUIRED',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  MIN_VALUE = 'MIN_VALUE',
  MAX_VALUE = 'MAX_VALUE',
  PATTERN = 'PATTERN',
  EMAIL = 'EMAIL',
  URL = 'URL',
  CUSTOM = 'CUSTOM',
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationRule {
  private constructor(
    private readonly _type: ValidationRuleType,
    private readonly _value?: any,
  ) {
    Object.freeze(this);
  }

  public static required(): ValidationRule {
    return new ValidationRule(ValidationRuleType.REQUIRED);
  }

  public static minLength(length: number): ValidationRule {
    if (length < 0) {
      throw new Error('MinLength must be non-negative');
    }
    return new ValidationRule(ValidationRuleType.MIN_LENGTH, length);
  }

  public static maxLength(length: number): ValidationRule {
    if (length < 0) {
      throw new Error('MaxLength must be non-negative');
    }
    return new ValidationRule(ValidationRuleType.MAX_LENGTH, length);
  }

  public static minValue(value: number): ValidationRule {
    return new ValidationRule(ValidationRuleType.MIN_VALUE, value);
  }

  public static maxValue(value: number): ValidationRule {
    return new ValidationRule(ValidationRuleType.MAX_VALUE, value);
  }

  public static pattern(regex: RegExp): ValidationRule {
    return new ValidationRule(ValidationRuleType.PATTERN, regex);
  }

  public static email(): ValidationRule {
    return new ValidationRule(ValidationRuleType.EMAIL);
  }

  public static url(): ValidationRule {
    return new ValidationRule(ValidationRuleType.URL);
  }

  public validate(value: any, errorMessage?: string): ValidationResult {
    switch (this._type) {
      case ValidationRuleType.REQUIRED:
        return this.validateRequired(value, errorMessage);
      case ValidationRuleType.MIN_LENGTH:
        return this.validateMinLength(value, errorMessage);
      case ValidationRuleType.MAX_LENGTH:
        return this.validateMaxLength(value, errorMessage);
      case ValidationRuleType.MIN_VALUE:
        return this.validateMinValue(value, errorMessage);
      case ValidationRuleType.MAX_VALUE:
        return this.validateMaxValue(value, errorMessage);
      case ValidationRuleType.PATTERN:
        return this.validatePattern(value, errorMessage);
      case ValidationRuleType.EMAIL:
        return this.validateEmail(value, errorMessage);
      case ValidationRuleType.URL:
        return this.validateUrl(value, errorMessage);
      default:
        return { isValid: true };
    }
  }

  private validateRequired(value: any, message?: string): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        error: message || 'Field is required',
      };
    }
    return { isValid: true };
  }

  private validateMinLength(value: any, message?: string): ValidationResult {
    if (typeof value === 'string' && value.length < this._value!) {
      return {
        isValid: false,
        error: message || `Minimum length is ${this._value}`,
      };
    }
    return { isValid: true };
  }

  private validateMaxLength(value: any, message?: string): ValidationResult {
    if (typeof value === 'string' && value.length > this._value!) {
      return {
        isValid: false,
        error: message || `Maximum length is ${this._value}`,
      };
    }
    return { isValid: true };
  }

  private validateMinValue(value: any, message?: string): ValidationResult {
    if (typeof value === 'number' && value < this._value!) {
      return {
        isValid: false,
        error: message || `Minimum value is ${this._value}`,
      };
    }
    return { isValid: true };
  }

  private validateMaxValue(value: any, message?: string): ValidationResult {
    if (typeof value === 'number' && value > this._value!) {
      return {
        isValid: false,
        error: message || `Maximum value is ${this._value}`,
      };
    }
    return { isValid: true };
  }

  private validatePattern(value: any, message?: string): ValidationResult {
    if (typeof value === 'string' && !this._value!.test(value)) {
      return {
        isValid: false,
        error: message || 'Invalid format',
      };
    }
    return { isValid: true };
  }

  private validateEmail(value: any, message?: string): ValidationResult {
    if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return {
        isValid: false,
        error: message || 'Invalid email format',
      };
    }
    return { isValid: true };
  }

  private validateUrl(value: any, message?: string): ValidationResult {
    try {
      if (typeof value === 'string' && value) {
        new URL(value);
      }
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: message || 'Invalid URL format',
      };
    }
  }

  public toJsonSchema(): Record<string, any> {
    switch (this._type) {
      case ValidationRuleType.MIN_LENGTH:
        return { minLength: this._value };
      case ValidationRuleType.MAX_LENGTH:
        return { maxLength: this._value };
      case ValidationRuleType.MIN_VALUE:
        return { minimum: this._value };
      case ValidationRuleType.MAX_VALUE:
        return { maximum: this._value };
      case ValidationRuleType.PATTERN:
        return { pattern: (this._value as RegExp).source };
      case ValidationRuleType.EMAIL:
        return { format: 'email' };
      case ValidationRuleType.URL:
        return { format: 'uri' };
      default:
        return {};
    }
  }

  public getType(): ValidationRuleType {
    return this._type;
  }

  public getValue(): any {
    return this._value;
  }
}

