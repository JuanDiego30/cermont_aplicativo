import { PrioridadAlerta } from '@/prisma/client';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { EnviarAlertaDto } from './dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async enviarAlerta(dto: EnviarAlertaDto) {
    this.logger.log('Enviando alerta', { tipo: dto.tipo, ordenId: dto.ordenId });

    if (!dto.ordenId) {
      throw new BadRequestException('ordenId es requerido');
    }

    if (!dto.usuarioId) {
      throw new BadRequestException('usuarioId es requerido');
    }

    try {
      const alerta = await this.prisma.alertaAutomatica.create({
        data: {
          tipo: dto.tipo,
          prioridad: dto.prioridad ?? PrioridadAlerta.info,
          titulo: dto.titulo,
          mensaje: dto.mensaje,
          ordenId: dto.ordenId,
          usuarioId: dto.usuarioId,
          metadata: dto.metadata ? JSON.parse(JSON.stringify(dto.metadata)) : undefined,
          leida: false,
          resuelta: false,
        },
      });

      this.eventEmitter.emit('alerta.creada', alerta);
      this.logger.log('Alerta creada', { alertaId: alerta.id });
      return alerta;
    } catch (error) {
      this.logger.error('Error enviando alerta', { error });
      throw error;
    }
  }

  async obtenerHistorial(
    userId: string,
    filters?: { leida?: boolean; tipo?: string; limit?: number; offset?: number }
  ) {
    const where: any = { usuarioId: userId };

    if (filters?.leida !== undefined) where.leida = filters.leida;
    if (filters?.tipo) where.tipo = filters.tipo;

    return this.prisma.alertaAutomatica.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });
  }

  async marcarComoLeida(alertaId: string, userId: string) {
    const alerta = await this.prisma.alertaAutomatica.findFirst({
      where: { id: alertaId, usuarioId: userId },
    });

    if (!alerta) throw new NotFoundException('Alerta no encontrada');

    return this.prisma.alertaAutomatica.update({
      where: { id: alertaId },
      data: { leida: true, leidaAt: new Date() },
    });
  }

  async marcarComoResuelta(alertaId: string, userId: string) {
    const alerta = await this.prisma.alertaAutomatica.findFirst({
      where: { id: alertaId },
    });

    if (!alerta) throw new NotFoundException('Alerta no encontrada');

    return this.prisma.alertaAutomatica.update({
      where: { id: alertaId },
      data: { resuelta: true, resueltaAt: new Date(), resueltoPorId: userId },
    });
  }

  async obtenerPorOrden(ordenId: string) {
    return this.prisma.alertaAutomatica.findMany({
      where: { ordenId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
