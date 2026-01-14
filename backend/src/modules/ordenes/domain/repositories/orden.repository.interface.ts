/**
 * @repository IOrdenRepository
 * @description Interface del repositorio de órdenes
 * @layer Domain
 */
import {
  OrdenEntity,
  OrdenProps,
  OrdenCreador,
  OrdenAsignado,
} from "../entities";
import { EstadoOrden, PrioridadLevel } from "../value-objects";

export const ORDEN_REPOSITORY = Symbol("ORDEN_REPOSITORY");

export interface OrdenFilters {
  estado?: EstadoOrden;
  cliente?: string;
  prioridad?: PrioridadLevel;
  asignadoId?: string;
  creadorId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page: number;
  limit: number;
}

export interface OrdenListResult {
  data: OrdenEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrdenRepository {
  findAll(filters: OrdenFilters): Promise<OrdenListResult>;

  findById(id: string): Promise<OrdenEntity | null>;

  findByNumero(numero: string): Promise<OrdenEntity | null>;

  create(orden: OrdenEntity): Promise<OrdenEntity>;

  update(orden: OrdenEntity): Promise<OrdenEntity>;

  updateEstado(id: string, estado: EstadoOrden): Promise<OrdenEntity>;

  delete(id: string): Promise<void>;

  count(): Promise<number>;

  getNextSequence(): Promise<number>;
}
