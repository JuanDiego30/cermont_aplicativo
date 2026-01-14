export abstract class EnumValueObject<TEnum extends string> {
  protected constructor(protected readonly _value: TEnum) {
    Object.freeze(this);
  }

  public getValue(): TEnum {
    return this._value;
  }

  public equals(other: this): boolean {
    if (!other) return false;
    if (!(other instanceof (this.constructor as any))) return false;
    return other._value === this._value;
  }

  public toJSON(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }
}
