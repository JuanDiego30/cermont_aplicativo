export class GetOrdersQuery {
  constructor(
    public readonly estado?: string,
    public readonly cliente?: string,
    public readonly prioridad?: string,
    public readonly asignadoId?: string,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}
