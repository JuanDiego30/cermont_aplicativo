import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  RegistrarSESDto,
  AprobarSESDto,
  GenerarFacturaDto,
  RegistrarPagoDto,
  SESResponseDto,
  FacturaResponseDto,
  ResumenFacturacionDto,
} from './application/dto/facturacion.dto';

/**
 * FacturacionService
 *
 * Works with existing Prisma schema: SES and Factura models from closing.prisma
 * Uses the existing EstadoSES and EstadoFactura enums (lowercase values)
 */
@Injectable()
export class FacturacionService {
  private readonly logger = new Logger(FacturacionService.name);

  // Alert thresholds (days)
  private readonly ALERTA_SES_APROBACION = 7;
  private readonly ALERTA_PAGO_VENCIDO = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Registrar SES de Ariba
   */
  async registrarSES(dto: RegistrarSESDto): Promise<SESResponseDto> {
    // Verify order exists
    const orden = await this.prisma.order.findUnique({
      where: { id: dto.ordenId },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${dto.ordenId} no encontrada`);
    }

    // Check if SES already exists for this order
    const existingSES = await this.prisma.sES.findUnique({
      where: { ordenId: dto.ordenId },
    });

    if (existingSES) {
      // Update existing SES
      const updated = await this.prisma.sES.update({
        where: { ordenId: dto.ordenId },
        data: {
          numeroSES: dto.numeroSES,
          estado: 'creada',
          observaciones: dto.observaciones,
        },
      });

      return this.mapSESToResponse(updated, orden.numero);
    }

    // Create new SES
    const ses = await this.prisma.sES.create({
      data: {
        ordenId: dto.ordenId,
        numeroSES: dto.numeroSES,
        estado: 'creada',
        descripcionServicio: orden.descripcion,
        valorTotal: dto.monto,
        observaciones: dto.observaciones,
      },
    });

    this.logger.log(`SES registrado: ${ses.id} - ${dto.numeroSES} para orden ${dto.ordenId}`);

    this.eventEmitter.emit('facturacion.ses.registrado', {
      sesId: ses.id,
      ordenId: dto.ordenId,
      numeroSES: dto.numeroSES,
    });

    return this.mapSESToResponse(ses, orden.numero);
  }

  /**
   * Aprobar SES
   */
  async aprobarSES(dto: AprobarSESDto): Promise<SESResponseDto> {
    const ses = await this.prisma.sES.findUnique({
      where: { id: dto.sesId },
      include: { orden: true },
    });

    if (!ses) {
      throw new NotFoundException(`SES ${dto.sesId} no encontrado`);
    }

    if (ses.estado === 'aprobada') {
      throw new BadRequestException('El SES ya está aprobado');
    }

    const updated = await this.prisma.sES.update({
      where: { id: dto.sesId },
      data: {
        estado: 'aprobada',
        fechaAprobacion: dto.fechaAprobacion ? new Date(dto.fechaAprobacion) : new Date(),
      },
    });

    this.logger.log(`SES aprobado: ${updated.id}`);

    this.eventEmitter.emit('facturacion.ses.aprobado', {
      sesId: updated.id,
      ordenId: ses.ordenId,
    });

    return this.mapSESToResponse(updated, ses.orden.numero);
  }

  /**
   * Generar factura
   */
  async generarFactura(dto: GenerarFacturaDto): Promise<FacturaResponseDto> {
    const ses = await this.prisma.sES.findUnique({
      where: { id: dto.sesId },
      include: { orden: true },
    });

    if (!ses) {
      throw new NotFoundException(`SES ${dto.sesId} no encontrado`);
    }

    // Check if factura already exists
    const existingFactura = await this.prisma.factura.findUnique({
      where: { ordenId: ses.ordenId },
    });

    const impuestos = dto.montoIVA || dto.monto * 0.19;
    const valorTotal = dto.monto + impuestos;
    const fechaVencimiento = dto.fechaVencimiento
      ? new Date(dto.fechaVencimiento)
      : this.calcularFechaVencimiento(new Date());

    if (existingFactura) {
      const updated = await this.prisma.factura.update({
        where: { ordenId: ses.ordenId },
        data: {
          numeroFactura: dto.numeroFactura,
          subtotal: dto.monto,
          impuestos,
          valorTotal,
          estado: 'generada',
          fechaVencimiento,
        },
      });

      return this.mapFacturaToResponse(updated);
    }

    const factura = await this.prisma.factura.create({
      data: {
        ordenId: ses.ordenId,
        numeroFactura: dto.numeroFactura,
        subtotal: dto.monto,
        impuestos,
        valorTotal,
        conceptos: ses.descripcionServicio,
        estado: 'generada',
        fechaVencimiento,
      },
    });

    this.logger.log(`Factura generada: ${factura.id} - ${dto.numeroFactura}`);

    this.eventEmitter.emit('facturacion.factura.generada', {
      facturaId: factura.id,
      sesId: dto.sesId,
      numeroFactura: dto.numeroFactura,
    });

    return this.mapFacturaToResponse(factura);
  }

  /**
   * Registrar pago
   */
  async registrarPago(dto: RegistrarPagoDto): Promise<FacturaResponseDto> {
    const factura = await this.prisma.factura.findUnique({
      where: { id: dto.facturaId },
    });

    if (!factura) {
      throw new NotFoundException(`Factura ${dto.facturaId} no encontrada`);
    }

    if (factura.estado === 'pagada') {
      throw new BadRequestException('La factura ya está pagada');
    }

    const updated = await this.prisma.factura.update({
      where: { id: dto.facturaId },
      data: {
        estado: 'pagada',
        fechaPago: dto.fechaPago ? new Date(dto.fechaPago) : new Date(),
      },
    });

    this.logger.log(`Pago registrado: ${updated.id}`);

    this.eventEmitter.emit('facturacion.pago.registrado', {
      facturaId: updated.id,
      montoPagado: dto.montoPagado,
    });

    return this.mapFacturaToResponse(updated);
  }

  /**
   * Obtener resumen de facturación
   */
  async getResumenFacturacion(): Promise<ResumenFacturacionDto> {
    // Pending SES
    const sesPendientes = await this.prisma.sES.findMany({
      where: {
        estado: { in: ['no_creada', 'creada', 'enviada'] },
      },
      include: { orden: true },
    });

    // Pending invoices
    const facturasPendientes = await this.prisma.factura.findMany({
      where: {
        estado: { in: ['generada', 'enviada', 'aprobada'] },
      },
    });

    // Totals
    const totales = await this.prisma.factura.aggregate({
      _sum: { valorTotal: true },
    });

    const pagadas = await this.prisma.factura.aggregate({
      where: { estado: 'pagada' },
      _sum: { valorTotal: true },
    });

    // Generate alerts
    const alertas = this.generarAlertas(sesPendientes, facturasPendientes);

    return {
      totalPendienteSES: sesPendientes.length,
      totalPendienteFacturacion: sesPendientes.filter(s => s.estado === 'aprobada').length,
      totalPendientePago: facturasPendientes.length,
      totalFacturado: totales._sum?.valorTotal || 0,
      totalPagado: pagadas._sum?.valorTotal || 0,
      sesPendientes: sesPendientes.map(s => this.mapSESToResponse(s, s.orden.numero)),
      facturasPendientes: facturasPendientes.map(f => this.mapFacturaToResponse(f)),
      alertas,
    };
  }

  /**
   * Obtener SES de una orden
   */
  async getSESPorOrden(ordenId: string): Promise<SESResponseDto[]> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }

    const ses = await this.prisma.sES.findUnique({
      where: { ordenId },
    });

    if (!ses) {
      return [];
    }

    return [this.mapSESToResponse(ses, orden.numero)];
  }

  private calcularFechaVencimiento(fechaEmision: Date): Date {
    const fecha = new Date(fechaEmision);
    fecha.setDate(fecha.getDate() + 30);
    return fecha;
  }

  private calcularDiasPendiente(fecha: Date): number {
    const hoy = new Date();
    const diffTime = hoy.getTime() - fecha.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private getAlertLevel(dias: number, umbral: number): 'INFO' | 'WARNING' | 'CRITICAL' | undefined {
    if (dias >= umbral * 2) return 'CRITICAL';
    if (dias >= umbral) return 'WARNING';
    if (dias >= umbral * 0.7) return 'INFO';
    return undefined;
  }

  private mapSESToResponse(ses: any, numeroOrden: string): SESResponseDto {
    const diasPendiente =
      ses.estado !== 'aprobada'
        ? this.calcularDiasPendiente(ses.fechaCreacion || ses.createdAt)
        : 0;

    return {
      id: ses.id,
      ordenId: ses.ordenId,
      numeroOrden,
      numeroSES: ses.numeroSES || '',
      monto: ses.valorTotal || 0,
      estado: (ses.estado || 'PENDIENTE').toString().toUpperCase(),
      fechaGeneracion: ses.fechaCreacion?.toISOString(),
      fechaEnvio: ses.fechaEnvio?.toISOString(),
      fechaAprobacion: ses.fechaAprobacion?.toISOString(),
      numeroAprobacion: undefined,
      observaciones: ses.observaciones,
      diasPendiente,
      alertLevel: this.getAlertLevel(diasPendiente, this.ALERTA_SES_APROBACION),
    };
  }

  private mapFacturaToResponse(factura: any): FacturaResponseDto {
    const diasPendiente =
      factura.estado !== 'pagada'
        ? this.calcularDiasPendiente(factura.fechaEmision || factura.createdAt)
        : 0;

    return {
      id: factura.id,
      sesId: '',
      numeroFactura: factura.numeroFactura || '',
      monto: factura.subtotal || 0,
      montoIVA: factura.impuestos,
      montoTotal: factura.valorTotal || 0,
      estado: (factura.estado || 'PENDIENTE').toString().toUpperCase(),
      fechaEmision: factura.fechaEmision?.toISOString(),
      fechaVencimiento: factura.fechaVencimiento?.toISOString(),
      fechaPago: factura.fechaPago?.toISOString(),
      montoPagado: factura.valorTotal,
      referenciaPago: undefined,
      diasPendiente,
      alertLevel: this.getAlertLevel(diasPendiente, this.ALERTA_PAGO_VENCIDO),
    };
  }

  private generarAlertas(
    sesPendientes: any[],
    facturasPendientes: any[]
  ): Array<{
    tipo: string;
    mensaje: string;
    nivel: string;
    relacionadoId: string;
  }> {
    const alertas: Array<{
      tipo: string;
      mensaje: string;
      nivel: string;
      relacionadoId: string;
    }> = [];

    for (const ses of sesPendientes) {
      const dias = this.calcularDiasPendiente(ses.fechaCreacion || ses.createdAt);

      if (ses.estado === 'enviada' && dias >= this.ALERTA_SES_APROBACION) {
        alertas.push({
          tipo: 'SES_SIN_APROBAR',
          mensaje: `SES ${ses.numeroSES || ses.id} lleva ${dias} días sin aprobar`,
          nivel: dias >= this.ALERTA_SES_APROBACION * 2 ? 'CRITICAL' : 'WARNING',
          relacionadoId: ses.id,
        });
      }
    }

    for (const factura of facturasPendientes) {
      const dias = this.calcularDiasPendiente(factura.fechaEmision || factura.createdAt);

      if (dias >= this.ALERTA_PAGO_VENCIDO) {
        alertas.push({
          tipo: 'PAGO_VENCIDO',
          mensaje: `Factura ${factura.numeroFactura || factura.id} tiene ${dias} días sin pago`,
          nivel: 'CRITICAL',
          relacionadoId: factura.id,
        });
      }
    }

    return alertas;
  }
}
