/**
 * Value Object: FieldType
 *
 * Tipo de campo de formulario con validaciones y metadatos
 */

export enum FieldTypeEnum {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  DATE = "DATE",
  TIME = "TIME",
  DATETIME = "DATETIME",
  SELECT = "SELECT",
  RADIO = "RADIO",
  CHECKBOX = "CHECKBOX",
  MULTISELECT = "MULTISELECT",
  FILE = "FILE",
  IMAGE = "IMAGE",
  SIGNATURE = "SIGNATURE",
  GEOLOCATION = "GEOLOCATION",
  RATING = "RATING",
  SLIDER = "SLIDER",
  CALCULATED = "CALCULATED",
}

export class FieldType {
  private constructor(private readonly _value: FieldTypeEnum) {
    Object.freeze(this);
  }

  public static text(): FieldType {
    return new FieldType(FieldTypeEnum.TEXT);
  }

  public static textarea(): FieldType {
    return new FieldType(FieldTypeEnum.TEXTAREA);
  }

  public static number(): FieldType {
    return new FieldType(FieldTypeEnum.NUMBER);
  }

  public static email(): FieldType {
    return new FieldType(FieldTypeEnum.EMAIL);
  }

  public static phone(): FieldType {
    return new FieldType(FieldTypeEnum.PHONE);
  }

  public static date(): FieldType {
    return new FieldType(FieldTypeEnum.DATE);
  }

  public static time(): FieldType {
    return new FieldType(FieldTypeEnum.TIME);
  }

  public static datetime(): FieldType {
    return new FieldType(FieldTypeEnum.DATETIME);
  }

  public static select(): FieldType {
    return new FieldType(FieldTypeEnum.SELECT);
  }

  public static radio(): FieldType {
    return new FieldType(FieldTypeEnum.RADIO);
  }

  public static checkbox(): FieldType {
    return new FieldType(FieldTypeEnum.CHECKBOX);
  }

  public static multiselect(): FieldType {
    return new FieldType(FieldTypeEnum.MULTISELECT);
  }

  public static file(): FieldType {
    return new FieldType(FieldTypeEnum.FILE);
  }

  public static image(): FieldType {
    return new FieldType(FieldTypeEnum.IMAGE);
  }

  public static signature(): FieldType {
    return new FieldType(FieldTypeEnum.SIGNATURE);
  }

  public static geolocation(): FieldType {
    return new FieldType(FieldTypeEnum.GEOLOCATION);
  }

  public static rating(): FieldType {
    return new FieldType(FieldTypeEnum.RATING);
  }

  public static slider(): FieldType {
    return new FieldType(FieldTypeEnum.SLIDER);
  }

  public static calculated(): FieldType {
    return new FieldType(FieldTypeEnum.CALCULATED);
  }

  public static fromString(value: string): FieldType {
    const enumValue = Object.values(FieldTypeEnum).find(
      (v) => v === value.toUpperCase(),
    );
    if (!enumValue) {
      throw new Error(`Invalid FieldType: ${value}`);
    }
    return new FieldType(enumValue);
  }

  public getValue(): FieldTypeEnum {
    return this._value;
  }

  public requiresOptions(): boolean {
    return [
      FieldTypeEnum.SELECT,
      FieldTypeEnum.RADIO,
      FieldTypeEnum.CHECKBOX,
      FieldTypeEnum.MULTISELECT,
    ].includes(this._value);
  }

  public isNumeric(): boolean {
    return [
      FieldTypeEnum.NUMBER,
      FieldTypeEnum.RATING,
      FieldTypeEnum.SLIDER,
    ].includes(this._value);
  }

  public isDate(): boolean {
    return [
      FieldTypeEnum.DATE,
      FieldTypeEnum.TIME,
      FieldTypeEnum.DATETIME,
    ].includes(this._value);
  }

  public allowsMultipleValues(): boolean {
    return [FieldTypeEnum.CHECKBOX, FieldTypeEnum.MULTISELECT].includes(
      this._value,
    );
  }

  public validateValue(value: any): boolean {
    switch (this._value) {
      case FieldTypeEnum.NUMBER:
      case FieldTypeEnum.RATING:
      case FieldTypeEnum.SLIDER:
        return typeof value === "number" && !isNaN(value);
      case FieldTypeEnum.EMAIL:
        return (
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        );
      case FieldTypeEnum.PHONE:
        return typeof value === "string" && /^[\d\s\-\+\(\)]+$/.test(value);
      case FieldTypeEnum.DATE:
      case FieldTypeEnum.TIME:
      case FieldTypeEnum.DATETIME:
        return !isNaN(new Date(value).getTime());
      case FieldTypeEnum.CHECKBOX:
        return typeof value === "boolean";
      case FieldTypeEnum.MULTISELECT:
        return Array.isArray(value);
      default:
        return typeof value === "string";
    }
  }

  public getJsonSchemaType(): string {
    switch (this._value) {
      case FieldTypeEnum.NUMBER:
      case FieldTypeEnum.RATING:
      case FieldTypeEnum.SLIDER:
        return "number";
      case FieldTypeEnum.CHECKBOX:
        return "boolean";
      case FieldTypeEnum.MULTISELECT:
        return "array";
      default:
        return "string";
    }
  }

  public equals(other: FieldType): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
