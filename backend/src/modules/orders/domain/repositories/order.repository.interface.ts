/**
 * @repository IOrderRepository
 * @description Interface del repositorio de órdenes
 * @layer Domain
 */
import {
  OrderEntity,
  OrderProps,
  OrderCreador,
  OrderAsignado,
} from "../entities";
import { EstadoOrder, PrioridadLevel } from "../value-objects";

export const Order_REPOSITORY = Symbol("Order_REPOSITORY");

export interface OrderFilters {
  estado?: EstadoOrder;
  cliente?: string;
  prioridad?: PrioridadLevel;
  asignadoId?: string;
  creadorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page: number;
  limit: number;
}

export interface OrderListResult {
  data: OrderEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderRepository {
  findAll(filters: OrderFilters): Promise<OrderListResult>;

  findById(id: string): Promise<OrderEntity | null>;

  findByNumero(numero: string): Promise<OrderEntity | null>;

  create(Order: OrderEntity): Promise<OrderEntity>;

  update(Order: OrderEntity): Promise<OrderEntity>;

  updateEstado(id: string, estado: EstadoOrder): Promise<OrderEntity>;

  delete(id: string): Promise<void>;

  count(): Promise<number>;

  getNextSequence(): Promise<number>;
}
