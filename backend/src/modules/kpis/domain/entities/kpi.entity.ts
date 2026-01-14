export class KpiEntity<T> {
  constructor(
    public readonly nombre: string,
    public readonly valor: T,
    public readonly unidad: string,
    public readonly timestamp: Date,
  ) {}

  static create<T>(nombre: string, valor: T, unidad: string): KpiEntity<T> {
    return new KpiEntity(nombre, valor, unidad, new Date());
  }
}
