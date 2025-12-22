/**
 * Use Case: DetectarActasSinFirmarUseCase
 * 
 * Detecta actas sin firmar por más de 7 días y crea alertas
 * Ejecutado por CRON diariamente a las 8 AM
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IAlertaRepository,
  ALERTA_REPOSITORY,
} from '../../domain/repositories/alerta.repository.interface';
import { Alerta } from '../../domain/entities/alerta.entity';
import { TipoAlertaEnum } from '../../domain/value-objects/tipo-alerta.vo';
import { PrioridadAlertaEnum } from '../../domain/value-objects/prioridad-alerta.vo';

@Injectable()
export class DetectarActasSinFirmarUseCase {
  private readonly logger = new Logger(DetectarActasSinFirmarUseCase.name);
  private static readonly DIAS_LIMITE = 7;

  constructor(
    @Inject(ALERTA_REPOSITORY)
    private readonly alertaRepository: IAlertaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(): Promise<{ alertasCreadas: number }> {
    this.logger.log('Verificando actas sin firmar...');

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - DetectarActasSinFirmarUseCase.DIAS_LIMITE);

    // Buscar actas pendientes
    const actasPendientes = await this.prisma.acta.findMany({
      where: {
        estado: { in: ['generada', 'enviada'] as any },
        fechaEmision: { lt: fechaLimite },
        alertaEnviada: false,
      },
      include: {
        orden: { select: { id: true, numero: true, asignadoId: true } },
      },
    });

    let alertasCreadas = 0;

    for (const acta of actasPendientes) {
      try {
        const orden = (acta as any).orden;
        const diasSinFirmar = this.calcularDias(acta.fechaEmision);

        // Verificar si ya existe una alerta similar
        const alertaExistente = await this.alertaRepository.findExistentAlerta(
          acta.ordenId,
          TipoAlertaEnum.ACTA_SIN_FIRMAR,
        );

        if (alertaExistente) {
          this.logger.debug(
            `Alerta ACTA_SIN_FIRMAR ya existe para orden ${acta.ordenId}`,
          );
          continue;
        }

        // Crear alerta solo si hay usuario asignado
        if (!orden?.asignadoId) {
          this.logger.warn(`Orden ${acta.ordenId} no tiene usuario asignado`);
          continue;
        }

        // Crear alerta usando el use case de envío
        // Nota: En una implementación completa, esto debería usar EnviarAlertaUseCase
        // Por ahora, creamos directamente para mantener compatibilidad con CRONs
        const alerta = Alerta.create({
          tipo: TipoAlertaEnum.ACTA_SIN_FIRMAR,
          prioridad: PrioridadAlertaEnum.WARNING,
          titulo: `Acta ${acta.numero} pendiente de firma`,
          mensaje: `El acta de la orden ${orden?.numero || acta.ordenId} lleva más de ${DetectarActasSinFirmarUseCase.DIAS_LIMITE} días sin firmar`,
          destinatarioId: orden.asignadoId,
          canales: ['EMAIL', 'IN_APP'], // Canales por defecto
          metadata: {
            ordenId: acta.ordenId,
            actaId: acta.id,
            diasSinFirmar,
          },
        });

        await this.alertaRepository.save(alerta);

        // Marcar acta como alerta enviada
        await this.prisma.acta.update({
          where: { id: acta.id },
          data: {
            alertaEnviada: true,
            diasSinFirmar,
          },
        });

        alertasCreadas++;
      } catch (error) {
        this.logger.error(
          `Error procesando acta ${acta.id}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(
      `${alertasCreadas} alertas de actas sin firmar generadas`,
    );

    return { alertasCreadas };
  }

  private calcularDias(fecha: Date): number {
    const hoy = new Date();
    const diff = hoy.getTime() - fecha.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

