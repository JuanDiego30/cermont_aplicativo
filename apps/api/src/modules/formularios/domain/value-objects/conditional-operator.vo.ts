/**
 * Value Object: ConditionalOperator
 *
 * Operador para lógica condicional en formularios
 */

export enum ConditionalOperatorEnum {
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
  LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
  CONTAINS = "CONTAINS",
  NOT_CONTAINS = "NOT_CONTAINS",
  IS_EMPTY = "IS_EMPTY",
  IS_NOT_EMPTY = "IS_NOT_EMPTY",
  STARTS_WITH = "STARTS_WITH",
  ENDS_WITH = "ENDS_WITH",
}

export class ConditionalOperator {
  private constructor(private readonly _value: ConditionalOperatorEnum) {
    Object.freeze(this);
  }

  public static equals(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.EQUALS);
  }

  public static notEquals(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.NOT_EQUALS);
  }

  public static greaterThan(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.GREATER_THAN);
  }

  public static lessThan(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.LESS_THAN);
  }

  public static greaterThanOrEqual(): ConditionalOperator {
    return new ConditionalOperator(
      ConditionalOperatorEnum.GREATER_THAN_OR_EQUAL,
    );
  }

  public static lessThanOrEqual(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.LESS_THAN_OR_EQUAL);
  }

  public static contains(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.CONTAINS);
  }

  public static notContains(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.NOT_CONTAINS);
  }

  public static isEmpty(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.IS_EMPTY);
  }

  public static isNotEmpty(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.IS_NOT_EMPTY);
  }

  public static startsWith(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.STARTS_WITH);
  }

  public static endsWith(): ConditionalOperator {
    return new ConditionalOperator(ConditionalOperatorEnum.ENDS_WITH);
  }

  public static fromString(value: string): ConditionalOperator {
    const enumValue = Object.values(ConditionalOperatorEnum).find(
      (v) => v === value.toUpperCase(),
    );
    if (!enumValue) {
      throw new Error(`Invalid ConditionalOperator: ${value}`);
    }
    return new ConditionalOperator(enumValue);
  }

  public evaluate(actualValue: any, expectedValue: any): boolean {
    switch (this._value) {
      case ConditionalOperatorEnum.EQUALS:
        return actualValue === expectedValue;
      case ConditionalOperatorEnum.NOT_EQUALS:
        return actualValue !== expectedValue;
      case ConditionalOperatorEnum.GREATER_THAN:
        return Number(actualValue) > Number(expectedValue);
      case ConditionalOperatorEnum.LESS_THAN:
        return Number(actualValue) < Number(expectedValue);
      case ConditionalOperatorEnum.GREATER_THAN_OR_EQUAL:
        return Number(actualValue) >= Number(expectedValue);
      case ConditionalOperatorEnum.LESS_THAN_OR_EQUAL:
        return Number(actualValue) <= Number(expectedValue);
      case ConditionalOperatorEnum.CONTAINS:
        return String(actualValue).includes(String(expectedValue));
      case ConditionalOperatorEnum.NOT_CONTAINS:
        return !String(actualValue).includes(String(expectedValue));
      case ConditionalOperatorEnum.IS_EMPTY:
        return (
          !actualValue ||
          actualValue === "" ||
          (Array.isArray(actualValue) && actualValue.length === 0)
        );
      case ConditionalOperatorEnum.IS_NOT_EMPTY:
        return (
          !!actualValue &&
          actualValue !== "" &&
          (!Array.isArray(actualValue) || actualValue.length > 0)
        );
      case ConditionalOperatorEnum.STARTS_WITH:
        return String(actualValue).startsWith(String(expectedValue));
      case ConditionalOperatorEnum.ENDS_WITH:
        return String(actualValue).endsWith(String(expectedValue));
      default:
        return false;
    }
  }

  public getValue(): ConditionalOperatorEnum {
    return this._value;
  }

  public equals(other: ConditionalOperator): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
