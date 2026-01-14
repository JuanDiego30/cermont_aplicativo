import { Injectable } from "@nestjs/common";
import { PinoLoggerService } from "../logger/pino-logger.service";

/**
 * REGLA 2: Base class para reducir duplicación
 * REGLA 8: Funciones <30 líneas
 * REGLA 9: Inyección de dependencias
 */
@Injectable()
export abstract class BaseService<T> {
  protected abstract readonly serviceName: string;

  constructor(protected readonly logger: PinoLoggerService) {
    // serviceName is abstract, setContext is handled in each method
  }

  /**
   * Obtener todos los registros
   */
  protected async getAll(
    repository: {
      findMany: (args: { skip?: number; take?: number }) => Promise<T[]>;
    },
    skip?: number,
    take?: number,
  ): Promise<T[]> {
    try {
      this.logger.log("Obteniendo todos los registros", this.serviceName);
      return await repository.findMany({ skip, take });
    } catch (error) {
      return this.handleError("Error obteniendo registros", error as Error);
    }
  }

  /**
   * Obtener por ID
   */
  protected async getById(
    repository: { findById: (id: string) => Promise<T | null> },
    id: string,
  ): Promise<T | null> {
    try {
      this.logger.log(`Obteniendo registro por ID: ${id}`, this.serviceName);
      return await repository.findById(id);
    } catch (error) {
      return this.handleError(
        `Error obteniendo registro ${id}`,
        error as Error,
      );
    }
  }

  /**
   * Crear nuevo
   */
  protected async create(
    repository: { create: (data: Partial<T>) => Promise<T> },
    data: Partial<T>,
  ): Promise<T> {
    try {
      this.logger.log("Creando nuevo registro", this.serviceName, { data });
      return await repository.create(data);
    } catch (error) {
      return this.handleError("Error creando registro", error as Error);
    }
  }

  /**
   * Actualizar
   */
  protected async update(
    repository: { update: (id: string, data: Partial<T>) => Promise<T> },
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    try {
      this.logger.log(`Actualizando registro ${id}`, this.serviceName, {
        data,
      });
      return await repository.update(id, data);
    } catch (error) {
      return this.handleError(
        `Error actualizando registro ${id}`,
        error as Error,
      );
    }
  }

  /**
   * Eliminar
   */
  protected async delete(
    repository: { delete: (id: string) => Promise<T> },
    id: string,
  ): Promise<T> {
    try {
      this.logger.log(`Eliminando registro ${id}`, this.serviceName);
      return await repository.delete(id);
    } catch (error) {
      return this.handleError(
        `Error eliminando registro ${id}`,
        error as Error,
      );
    }
  }

  /**
   * Manejo centralizado de errores
   */
  protected handleError(message: string, error: Error): never {
    this.logger.error(message, error.stack, this.serviceName, {
      errorMessage: error.message,
      errorName: error.name,
    });
    throw error;
  }

  /**
   * Validación genérica
   */
  protected validateInput(
    data: Record<string, unknown>,
    requiredFields: string[],
  ): boolean {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
    return true;
  }
}
