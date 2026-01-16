import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CertificacionResponseDto,
  CreateCertificacionTecnicoDto,
  ValidacionResultDto,
  ValidarCertificacionesDto,
} from './application/dto/certificaciones.dto';
import { CertificacionTecnico } from './domain/entities/certificacion-tecnico.entity';
import { EstadoVigencia, EstadoVigenciaType } from './domain/value-objects/estado-vigencia.vo';

type CertificadoRecord = {
  id: string;
  tipo: string;
  nombre: string;
  entidad: string;
  numero: string;
  fechaExpedicion: Date;
  fechaVencimiento: Date;
  archivo: string | null;
  observaciones: string | null;
};

@Injectable()
export class CertificationsService {
  private readonly logger = new Logger(CertificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  private mapCertificadoToResponse(cert: CertificadoRecord): CertificacionResponseDto {
    const estadoVigencia = EstadoVigencia.fromFechaVencimiento(cert.fechaVencimiento);

    return {
      id: cert.id,
      tipo: cert.tipo,
      tipoDisplay: cert.nombre,
      entidadCertificadora: cert.entidad,
      numeroCertificado: cert.numero,
      fechaEmision: cert.fechaExpedicion.toISOString(),
      fechaVencimiento: cert.fechaVencimiento.toISOString(),
      estadoVigencia: estadoVigencia.getValue(),
      diasRestantes: estadoVigencia.getDiasRestantes(),
      mensajeVigencia: estadoVigencia.getDisplayMessage(),
      alertLevel: estadoVigencia.getAlertLevel(),
      archivoUrl: cert.archivo || undefined,
      observaciones: cert.observaciones || undefined,
    };
  }

  /**
   * Registrar nueva certificación de técnico
   */
  async registrarCertificacionTecnico(
    dto: CreateCertificacionTecnicoDto
  ): Promise<CertificacionResponseDto> {
    // Validar que el técnico existe
    const tecnico = await this.prisma.user.findUnique({
      where: { id: dto.tecnicoId },
    });

    if (!tecnico) {
      throw new NotFoundException(`Técnico con ID ${dto.tecnicoId} no encontrado`);
    }

    // Crear entidad de dominio (valida reglas de negocio)
    const certificacion = CertificacionTecnico.create({
      tecnicoId: dto.tecnicoId,
      tipo: dto.tipo,
      entidadCertificadora: dto.entidadCertificadora,
      numeroCertificado: dto.numeroCertificado,
      fechaEmision: new Date(dto.fechaEmision),
      fechaVencimiento: new Date(dto.fechaVencimiento),
      archivoUrl: dto.archivoUrl,
      observaciones: dto.observaciones,
    });

    // Persistir (usando tabla genérica por ahora, migrar a tabla específica)
    // TODO: Agregar modelo CertificacionTecnico en Prisma schema
    const saved = await this.prisma.certificado.create({
      data: {
        id: certificacion.id,
        userId: certificacion.tecnicoId,
        tipo: certificacion.tipo.getValue(),
        nombre: certificacion.tipo.getDisplayName(),
        entidad: certificacion.entidadCertificadora,
        numero: certificacion.numeroCertificado,
        fechaExpedicion: certificacion.fechaEmision,
        fechaVencimiento: certificacion.fechaVencimiento,
        archivo: certificacion.archivoUrl,
        observaciones: certificacion.observaciones,
        activo: true,
      },
    });

    this.logger.log(`Certificación registrada: ${saved.id} para técnico ${dto.tecnicoId}`);

    // Emitir evento
    this.eventEmitter.emit('certificacion.registrada', {
      certificacionId: saved.id,
      tecnicoId: dto.tecnicoId,
      tipo: dto.tipo,
    });

    return certificacion.toDTO() as CertificacionResponseDto;
  }

  /**
   * Obtener certificaciones de un técnico
   */
  async getCertificacionesTecnico(tecnicoId: string): Promise<CertificacionResponseDto[]> {
    const certificados = await this.prisma.certificado.findMany({
      where: {
        userId: tecnicoId,
        activo: true,
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    return (certificados as CertificadoRecord[]).map(cert => this.mapCertificadoToResponse(cert));
  }

  /**
   * Validar certificaciones para una orden
   */
  async validarCertificaciones(dto: ValidarCertificacionesDto): Promise<ValidacionResultDto> {
    const valid: CertificacionResponseDto[] = [];
    const invalid: Array<{
      id: string;
      nombre: string;
      tipo: string;
      razon: string;
    }> = [];
    const alerts: Array<{
      id: string;
      tipo: string;
      diasRestantes: number;
      nivel: string;
    }> = [];

    for (const tecnicoId of dto.tecnicosIds) {
      const certificaciones = await this.getCertificacionesTecnico(tecnicoId);

      // Obtener nombre del técnico
      const tecnico = await this.prisma.user.findUnique({
        where: { id: tecnicoId },
        select: { name: true },
      });
      const nombreTecnico = tecnico?.name || 'Desconocido';

      if (certificaciones.length === 0) {
        invalid.push({
          id: tecnicoId,
          nombre: nombreTecnico,
          tipo: 'TECNICO',
          razon: 'Sin certificaciones registradas',
        });
        continue;
      }

      // Verificar tipos requeridos si se especificaron
      if (dto.tiposRequeridos && dto.tiposRequeridos.length > 0) {
        for (const tipoRequerido of dto.tiposRequeridos) {
          const certTipo = certificaciones.find(c => c.tipo === tipoRequerido);

          if (!certTipo) {
            invalid.push({
              id: tecnicoId,
              nombre: nombreTecnico,
              tipo: tipoRequerido,
              razon: `Certificación ${tipoRequerido} no encontrada`,
            });
          } else if (certTipo.estadoVigencia === EstadoVigenciaType.VENCIDA) {
            invalid.push({
              id: tecnicoId,
              nombre: nombreTecnico,
              tipo: tipoRequerido,
              razon: `Certificación ${tipoRequerido} vencida`,
            });
          } else {
            valid.push(certTipo);

            // Agregar alerta si está por vencer
            if (certTipo.alertLevel) {
              alerts.push({
                id: certTipo.id,
                tipo: certTipo.tipo,
                diasRestantes: certTipo.diasRestantes,
                nivel: certTipo.alertLevel,
              });
            }
          }
        }
      } else {
        // Sin tipos específicos, verificar que tenga al menos una vigente
        const tieneVigente = certificaciones.some(
          c => c.estadoVigencia !== EstadoVigenciaType.VENCIDA
        );

        if (!tieneVigente) {
          invalid.push({
            id: tecnicoId,
            nombre: nombreTecnico,
            tipo: 'TODAS',
            razon: 'Todas las certificaciones están vencidas',
          });
        } else {
          valid.push(
            ...certificaciones.filter(c => c.estadoVigencia !== EstadoVigenciaType.VENCIDA)
          );

          // Alertas
          certificaciones
            .filter(c => c.alertLevel)
            .forEach(c => {
              alerts.push({
                id: c.id,
                tipo: c.tipo,
                diasRestantes: c.diasRestantes,
                nivel: c.alertLevel!,
              });
            });
        }
      }
    }

    return {
      allValid: invalid.length === 0,
      valid,
      invalid,
      alerts,
    };
  }

  /**
   * Obtener certificaciones próximas a vencer
   */
  async getCertificacionesPorVencer(dias: number = 30): Promise<CertificacionResponseDto[]> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const certificados = await this.prisma.certificado.findMany({
      where: {
        activo: true,
        fechaVencimiento: {
          lte: fechaLimite,
          gte: new Date(), // Solo las que aún no vencieron
        },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    return (certificados as CertificadoRecord[]).map(cert => this.mapCertificadoToResponse(cert));
  }
}
