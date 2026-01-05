/**
 * Value Object: ItemType
 *
 * Tipo de item en un kit (HERRAMIENTA, REPUESTO, EQUIPO, MATERIAL, CONSUMIBLE)
 */

export enum ItemTypeEnum {
  HERRAMIENTA = "HERRAMIENTA",
  REPUESTO = "REPUESTO",
  EQUIPO = "EQUIPO",
  MATERIAL = "MATERIAL",
  CONSUMIBLE = "CONSUMIBLE",
  DOCUMENTO = "DOCUMENTO",
}

export class ItemType {
  private constructor(private readonly _value: ItemTypeEnum) {
    Object.freeze(this);
  }

  public static create(value: string): ItemType {
    const enumValue =
      ItemTypeEnum[value.toUpperCase() as keyof typeof ItemTypeEnum];
    if (!enumValue) {
      return ItemType.herramienta(); // Default
    }
    return new ItemType(enumValue);
  }

  public static herramienta(): ItemType {
    return new ItemType(ItemTypeEnum.HERRAMIENTA);
  }

  public static repuesto(): ItemType {
    return new ItemType(ItemTypeEnum.REPUESTO);
  }

  public static equipo(): ItemType {
    return new ItemType(ItemTypeEnum.EQUIPO);
  }

  public static material(): ItemType {
    return new ItemType(ItemTypeEnum.MATERIAL);
  }

  public static consumible(): ItemType {
    return new ItemType(ItemTypeEnum.CONSUMIBLE);
  }

  public static documento(): ItemType {
    return new ItemType(ItemTypeEnum.DOCUMENTO);
  }

  public getValue(): ItemTypeEnum {
    return this._value;
  }

  public esDevolvible(): boolean {
    // Consumibles no se devuelven
    return (
      this._value !== ItemTypeEnum.CONSUMIBLE &&
      this._value !== ItemTypeEnum.DOCUMENTO
    );
  }

  public requiereMantenimiento(): boolean {
    return [ItemTypeEnum.HERRAMIENTA, ItemTypeEnum.EQUIPO].includes(
      this._value,
    );
  }

  public requiereCertificacion(): boolean {
    return [ItemTypeEnum.HERRAMIENTA, ItemTypeEnum.EQUIPO].includes(
      this._value,
    );
  }

  public equals(other: ItemType): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
