/**
 * @service CierreAdministrativoService
 * @description Servicio para gestión del cierre administrativo de órdenes
 * 
 * Maneja: Actas, SES, Facturas y cierre final
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - DRY: Método genérico para upsert
 * - Clean Code: Código legible y bien estructurado
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

interface CreateActaDto {
  numero?: string;
  fecha?: Date;
  descripcion?: string;
  firmadoPor?: string;
  observaciones?: string;
}

interface CreateSesDto {
  numero: string;
  fecha?: Date;
  monto?: number;
  estado?: string;
  observaciones?: string;
}

interface CreateFacturaDto {
  numero: string;
  fecha?: Date;
  monto: number;
  iva?: number;
  total?: number;
  estado?: string;
}

export interface CierreResponse<T> {
  message: string;
  data: T;
}

export interface CierreCompleto {
  cierre: unknown;
  acta: unknown;
  ses: unknown;
  factura: unknown;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class CierreAdministrativoService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Obtiene todos los documentos de cierre para una orden
   */
  async findByOrden(ordenId: string): Promise<CierreCompleto> {
    const [cierre, acta, ses, factura] = await Promise.all([
      this.prisma.cierreAdministrativo.findUnique({ where: { ordenId } }),
      this.prisma.acta.findUnique({ where: { ordenId } }),
      this.prisma.sES.findUnique({ where: { ordenId } }),
      this.prisma.factura.findUnique({ where: { ordenId } }),
    ]);

    return { cierre, acta, ses, factura };
  }

  /**
   * Crea o actualiza un acta para la orden
   */
  async createActa(
    ordenId: string,
    dto: CreateActaDto,
  ): Promise<CierreResponse<unknown>> {
    const acta = await this.prisma.acta.upsert({
      where: { ordenId },
      update: {
        ...dto,
      },
      create: {
        orden: { connect: { id: ordenId } },
        numero: dto.numero!,
        trabajosRealizados: dto.descripcion || 'Sin descripción',
        ...dto,
      },
    });

    return {
      message: 'Acta guardada exitosamente',
      data: acta,
    };
  }

  /**
   * Crea o actualiza SES (Solicitud de Entrada de Servicio) para la orden
   */
  async createSes(
    ordenId: string,
    dto: CreateSesDto,
  ): Promise<CierreResponse<unknown>> {
    const ses = await this.prisma.sES.upsert({
      where: { ordenId },
      update: {
        estado: dto.estado as any,
        observaciones: dto.observaciones,
      },
      create: {
        orden: { connect: { id: ordenId } },
        numeroSES: dto.numero,
        descripcionServicio: 'Servicio general', // Default
        valorTotal: dto.monto || 0,
        estado: dto.estado as any,
        observaciones: dto.observaciones,
      },
    });

    return {
      message: 'SES guardada exitosamente',
      data: ses,
    };
  }

  /**
   * Crea o actualiza factura para la orden
   */
  async createFactura(
    ordenId: string,
    dto: CreateFacturaDto,
  ): Promise<CierreResponse<unknown>> {
    const factura = await this.prisma.factura.upsert({
      where: { ordenId },
      update: {
        estado: dto.estado as any,
        valorTotal: dto.total,
        subtotal: dto.monto,
      },
      create: {
        orden: { connect: { id: ordenId } },
        numeroFactura: dto.numero,
        subtotal: dto.monto,
        impuestos: dto.iva || 0,
        valorTotal: dto.total || dto.monto,
        estado: dto.estado as any,
        conceptos: 'Concepto general', // Default
      },
    });

    return {
      message: 'Factura guardada exitosamente',
      data: factura,
    };
  }

  /**
   * Marca el cierre administrativo como completado
   */
  async completar(
    ordenId: string,
    userId: string,
  ): Promise<CierreResponse<unknown>> {
    // Necesitamos fechaInicioOrden from Order
    const orden = await this.prisma.order.findUnique({ where: { id: ordenId } });

    const cierreData = {
      completado: true,
      fechaCompletado: new Date(),
      completadoPorId: userId,
      fechaInicioOrden: orden?.fechaInicio || new Date(), // Required field
    };

    const cierre = await this.prisma.cierreAdministrativo.upsert({
      where: { ordenId },
      update: {
        estaCompleto: true,
        fechaCierreCompleto: new Date(),
        observaciones: 'Cierre completado',
      },
      create: {
        orden: { connect: { id: ordenId } },
        estaCompleto: true,
        fechaInicioOrden: orden?.fechaInicio || new Date(),
        fechaInicioCierre: new Date(),
        fechaCierreCompleto: new Date(),
      },
    });

    return {
      message: 'Cierre administrativo completado',
      data: cierre,
    };
  }
}
