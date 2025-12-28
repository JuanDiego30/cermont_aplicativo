import { Injectable } from '@nestjs/common';
import { PinoLoggerService } from '../logger/pino-logger.service';

/**
 * REGLA 2: Base class para reducir duplicación
 * REGLA 8: Funciones <30 líneas
 * REGLA 9: Inyección de dependencias
 */
@Injectable()
export abstract class BaseService<T> {
  protected abstract readonly serviceName: string;

  constructor(
    protected readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext(this.serviceName);
  }

  /**
   * Obtener todos los registros
   */
  protected async getAll(
    repository: any,
    skip?: number,
    take?: number,
  ): Promise<T[]> {
    try {
      this.logger.log('Obteniendo todos los registros', this.serviceName);
      return await repository.findMany({ skip, take });
    } catch (error) {
      this.handleError('Error obteniendo registros', error);
    }
  }

  /**
   * Obtener por ID
   */
  protected async getById(repository: any, id: string): Promise<T | null> {
    try {
      this.logger.log(`Obteniendo registro por ID: ${id}`, this.serviceName);
      return await repository.findById(id);
    } catch (error) {
      this.handleError(`Error obteniendo registro ${id}`, error);
    }
  }

  /**
   * Crear nuevo
   */
  protected async create(repository: any, data: Partial<T>): Promise<T> {
    try {
      this.logger.log('Creando nuevo registro', this.serviceName, { data });
      return await repository.create(data);
    } catch (error) {
      this.handleError('Error creando registro', error);
    }
  }

  /**
   * Actualizar
   */
  protected async update(
    repository: any,
    id: string,
    data: Partial<T>,
  ): Promise<T> {
    try {
      this.logger.log(`Actualizando registro ${id}`, this.serviceName, { data });
      return await repository.update(id, data);
    } catch (error) {
      this.handleError(`Error actualizando registro ${id}`, error);
    }
  }

  /**
   * Eliminar
   */
  protected async delete(repository: any, id: string): Promise<T> {
    try {
      this.logger.log(`Eliminando registro ${id}`, this.serviceName);
      return await repository.delete(id);
    } catch (error) {
      this.handleError(`Error eliminando registro ${id}`, error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  protected handleError(message: string, error: Error): void {
    this.logger.error(message, error.stack, this.serviceName, {
      errorMessage: error.message,
      errorName: error.name,
    });
    throw error;
  }

  /**
   * Validación genérica
   */
  protected validateInput(data: any, requiredFields: string[]): boolean {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
    return true;
  }
}
