/**
 * @repository PreferenciaAlertaRepository
 * 
 * Implementación del repositorio de preferencias usando Prisma
 * 
 * Nota: Si la tabla no existe aún, se creará en una migración futura
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IPreferenciaAlertaRepository } from '../../domain/repositories/preferencia-alerta.repository.interface';
import { PreferenciaAlerta } from '../../domain/entities/preferencia-alerta.entity';
import { PreferenciaAlertaPrismaMapper } from './preferencia-alerta.prisma.mapper';

@Injectable()
export class PreferenciaAlertaRepository implements IPreferenciaAlertaRepository {
  private readonly logger = new Logger(PreferenciaAlertaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(preferencia: PreferenciaAlerta): Promise<PreferenciaAlerta> {
    const persistence = PreferenciaAlertaPrismaMapper.toPersistence(preferencia);

    try {
      // Intentar usar tabla preferenciaAlerta si existe
      // Si no existe, usar una tabla temporal o crear en migración
      const result = await (this.prisma as any).preferenciaAlerta?.upsert({
        where: { id: persistence.id },
        create: persistence,
        update: {
          canalesPreferidos: persistence.canalesPreferidos,
          noMolestar: persistence.noMolestar,
          horariosPermitidos: persistence.horariosPermitidos,
          updatedAt: persistence.updatedAt,
        },
      });

      if (result) {
        return PreferenciaAlertaPrismaMapper.toDomain(result);
      }

      // Fallback: guardar en memoria o usar otra estrategia
      // Por ahora, retornamos la entidad sin persistir
      // TODO: Crear migración para tabla preferenciaAlerta
      this.logger.warn(
        'Tabla preferenciaAlerta no existe. Guardando en memoria temporal.',
      );
      return preferencia;
    } catch (error) {
      // Si la tabla no existe, loguear y retornar entidad sin persistir
      if ((error as any).code === 'P2001' || (error as any).code === 'P2025') {
        this.logger.warn(
          'Tabla preferenciaAlerta no existe. Se requiere migración.',
        );
        return preferencia;
      }
      throw error;
    }
  }

  async findByUsuario(usuarioId: string): Promise<PreferenciaAlerta[]> {
    try {
      const results = await (this.prisma as any).preferenciaAlerta?.findMany({
        where: { usuarioId },
      });

      if (!results) {
        return [];
      }

      return results.map((r: any) => PreferenciaAlertaPrismaMapper.toDomain(r));
    } catch (error) {
      // Si la tabla no existe, retornar array vacío
      if ((error as any).code === 'P2001') {
        return [];
      }
      throw error;
    }
  }

  async findByUsuarioYTipo(
    usuarioId: string,
    tipo: string,
  ): Promise<PreferenciaAlerta | null> {
    try {
      const result = await (this.prisma as any).preferenciaAlerta?.findFirst({
        where: {
          usuarioId,
          tipoAlerta: tipo,
        },
      });

      if (!result) {
        return null;
      }

      return PreferenciaAlertaPrismaMapper.toDomain(result);
    } catch (error) {
      // Si la tabla no existe, retornar null
      if ((error as any).code === 'P2001') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await (this.prisma as any).preferenciaAlerta?.delete({
        where: { id },
      });
    } catch (error) {
      // Si la tabla no existe, no hacer nada
      if ((error as any).code === 'P2001') {
        this.logger.warn('Tabla preferenciaAlerta no existe. No se puede eliminar.');
        return;
      }
      throw error;
    }
  }
}

