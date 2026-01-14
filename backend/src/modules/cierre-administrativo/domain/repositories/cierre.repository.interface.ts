/**
 * @interface ICierreAdministrativoRepository
 *
 * Repository interface for cierre administrativo (DIP compliant)
 */

import { CierreAdministrativo } from "../entities";
import { CierreId } from "../value-objects";

export const CIERRE_ADMINISTRATIVO_REPOSITORY = Symbol(
  "CIERRE_ADMINISTRATIVO_REPOSITORY",
);

export interface CierreQueryFilters {
  status?: string;
  ordenId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ICierreAdministrativoRepository {
  save(cierre: CierreAdministrativo): Promise<CierreAdministrativo>;
  findById(id: CierreId): Promise<CierreAdministrativo | null>;
  findByOrdenId(ordenId: string): Promise<CierreAdministrativo | null>;
  findMany(
    filters: CierreQueryFilters,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<CierreAdministrativo>>;
  exists(ordenId: string): Promise<boolean>;
  delete(id: CierreId): Promise<void>;
}
