/**
 * @service AlertasService
 *
 * Servicio para gestión de alertas automáticas.
 * CRONs para detectar: actas sin firmar, SES pendientes, facturas vencidas, etc.
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

// String literal types matching Prisma enums
type TipoAlerta = 'ACTA_SIN_FIRMAR' | 'SES_PENDIENTE' | 'FACTURA_VENCIDA' | 'RECURSO_FALTANTE' | 'CERTIFICACION_VENCIDA' | 'RETRASO_CRONOGRAMA' | 'PROPUESTA_SIN_RESPUESTA';
type PrioridadAlerta = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

@Injectable()
export class AlertasService {
    private readonly logger = new Logger(AlertasService.name);

    constructor(private readonly prisma: PrismaService) { }

    // =====================================================
    // CRON: Detectar actas sin firmar (>7 días)
    // Ejecuta diariamente a las 8 AM
    // =====================================================
    @Cron('0 8 * * *', { name: 'check-actas-sin-firmar' })
    async checkActasSinFirmar() {
        this.logger.log('Verificando actas sin firmar...');

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 7);

        const actasPendientes = await this.prisma.acta.findMany({
            where: {
                estado: { in: ['GENERADA', 'ENVIADA'] },
                fechaEmision: { lt: fechaLimite },
                alertaEnviada: false,
            },
            include: {
                orden: { select: { id: true, numero: true, asignadoId: true } },
            },
        });

        for (const acta of actasPendientes) {
            await this.crearAlerta({
                ordenId: acta.ordenId,
                tipo: 'ACTA_SIN_FIRMAR',
                prioridad: 'WARNING',
                titulo: `Acta ${acta.numero} pendiente de firma`,
                mensaje: `El acta de la orden ${acta.orden.numero} lleva más de 7 días sin firmar`,
                usuarioId: acta.orden.asignadoId,
            });

            await this.prisma.acta.update({
                where: { id: acta.id },
                data: { alertaEnviada: true, diasSinFirmar: this.calcularDias(acta.fechaEmision) },
            });
        }

        this.logger.log(`${actasPendientes.length} alertas de actas sin firmar generadas`);
    }

    // =====================================================
    // CRON: Detectar SES sin aprobar (>5 días)
    // Ejecuta diariamente a las 9 AM
    // =====================================================
    @Cron('0 9 * * *', { name: 'check-ses-pendientes' })
    async checkSESPendientes() {
        this.logger.log('Verificando SES pendientes de aprobación...');

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 5);

        const sesPendientes = await this.prisma.sES.findMany({
            where: {
                estado: { in: ['CREADA', 'ENVIADA'] },
                fechaCreacion: { lt: fechaLimite },
                alertaEnviada: false,
            },
            include: {
                orden: { select: { id: true, numero: true } },
            },
        });

        for (const ses of sesPendientes) {
            await this.crearAlerta({
                ordenId: ses.ordenId,
                tipo: 'SES_PENDIENTE',
                prioridad: 'WARNING',
                titulo: `SES ${ses.numeroSES} sin aprobar`,
                mensaje: `La SES de la orden ${ses.orden.numero} lleva más de 5 días sin aprobar en ARIBA`,
            });

            await this.prisma.sES.update({
                where: { id: ses.id },
                data: { alertaEnviada: true, diasSinAprobar: this.calcularDias(ses.fechaCreacion) },
            });
        }

        this.logger.log(`${sesPendientes.length} alertas de SES pendientes generadas`);
    }

    // =====================================================
    // CRON: Detectar facturas vencidas
    // Ejecuta diariamente a las 10 AM
    // =====================================================
    @Cron('0 10 * * *', { name: 'check-facturas-vencidas' })
    async checkFacturasVencidas() {
        this.logger.log('Verificando facturas vencidas...');

        const hoy = new Date();

        const facturasVencidas = await this.prisma.factura.findMany({
            where: {
                estado: { in: ['GENERADA', 'ENVIADA', 'APROBADA'] },
                fechaVencimiento: { lt: hoy },
                alertaEnviada: false,
            },
            include: {
                orden: { select: { id: true, numero: true } },
            },
        });

        for (const factura of facturasVencidas) {
            const diasVencidos = this.calcularDias(factura.fechaVencimiento!);
            const prioridad = diasVencidos > 30 ? 'CRITICAL' : diasVencidos > 15 ? 'ERROR' : 'WARNING';

            await this.crearAlerta({
                ordenId: factura.ordenId,
                tipo: 'FACTURA_VENCIDA',
                prioridad,
                titulo: `Factura ${factura.numeroFactura} vencida`,
                mensaje: `La factura de la orden ${factura.orden.numero} está vencida hace ${diasVencidos} días`,
            });

            await this.prisma.factura.update({
                where: { id: factura.id },
                data: { alertaEnviada: true, diasVencidos },
            });
        }

        this.logger.log(`${facturasVencidas.length} alertas de facturas vencidas generadas`);
    }

    // =====================================================
    // CRON: Detectar propuestas sin respuesta (>15 días)
    // Ejecuta cada lunes a las 8 AM
    // =====================================================
    @Cron('0 8 * * 1', { name: 'check-propuestas-sin-respuesta' })
    async checkPropuestasSinRespuesta() {
        this.logger.log('Verificando propuestas sin respuesta...');

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 15);

        const propuestasPendientes = await this.prisma.propuestaEconomica.findMany({
            where: {
                aprobada: false,
                fechaEnvio: { not: null, lt: fechaLimite },
                fechaAprobacion: null,
                fechaRechazo: null,
            },
            include: {
                orden: { select: { id: true, numero: true, cliente: true } },
            },
        });

        for (const propuesta of propuestasPendientes) {
            await this.crearAlerta({
                ordenId: propuesta.ordenId,
                tipo: 'PROPUESTA_SIN_RESPUESTA',
                prioridad: 'INFO',
                titulo: `Propuesta sin respuesta - ${propuesta.orden.cliente}`,
                mensaje: `La propuesta para ${propuesta.orden.numero} lleva más de 15 días sin respuesta del cliente`,
            });
        }

        this.logger.log(`${propuestasPendientes.length} alertas de propuestas sin respuesta generadas`);
    }

    // =====================================================
    // MÉTODOS CRUD DE ALERTAS
    // =====================================================

    /**
     * Obtener alertas pendientes de un usuario
     */
    async getAlertasUsuario(usuarioId: string) {
        return this.prisma.alertaAutomatica.findMany({
            where: {
                usuarioId,
                resuelta: false,
            },
            orderBy: [
                { prioridad: 'desc' },
                { createdAt: 'desc' },
            ],
            include: {
                orden: { select: { numero: true, cliente: true } },
            },
        });
    }

    /**
     * Obtener todas las alertas pendientes (para admins)
     */
    async getTodasAlertasPendientes() {
        return this.prisma.alertaAutomatica.findMany({
            where: { resuelta: false },
            orderBy: [
                { prioridad: 'desc' },
                { createdAt: 'desc' },
            ],
            include: {
                orden: { select: { numero: true, cliente: true } },
                usuario: { select: { name: true, email: true } },
            },
        });
    }

    /**
     * Marcar alerta como leída
     */
    async marcarLeida(alertaId: string) {
        return this.prisma.alertaAutomatica.update({
            where: { id: alertaId },
            data: { leida: true, leidaAt: new Date() },
        });
    }

    /**
     * Marcar alerta como resuelta
     */
    async marcarResuelta(alertaId: string) {
        return this.prisma.alertaAutomatica.update({
            where: { id: alertaId },
            data: { resuelta: true, resueltaAt: new Date() },
        });
    }

    /**
     * Obtener resumen de alertas para dashboard
     */
    async getResumenAlertas() {
        const [total, criticas, noLeidas, porTipo] = await Promise.all([
            this.prisma.alertaAutomatica.count({ where: { resuelta: false } }),
            this.prisma.alertaAutomatica.count({ where: { resuelta: false, prioridad: 'CRITICAL' } }),
            this.prisma.alertaAutomatica.count({ where: { leida: false, resuelta: false } }),
            this.prisma.alertaAutomatica.groupBy({
                by: ['tipo'],
                where: { resuelta: false },
                _count: true,
            }),
        ]);

        return {
            total,
            criticas,
            noLeidas,
            porTipo: porTipo.reduce((acc, item) => {
                acc[item.tipo] = item._count;
                return acc;
            }, {} as Record<string, number>),
        };
    }

    // =====================================================
    // MÉTODOS PRIVADOS
    // =====================================================

    private async crearAlerta(data: {
        ordenId: string;
        tipo: TipoAlerta;
        prioridad: PrioridadAlerta;
        titulo: string;
        mensaje: string;
        usuarioId?: string | null;
    }) {
        // Verificar si ya existe una alerta similar no resuelta
        const existente = await this.prisma.alertaAutomatica.findFirst({
            where: {
                ordenId: data.ordenId,
                tipo: data.tipo,
                resuelta: false,
            },
        });

        if (existente) {
            this.logger.debug(`Alerta ${data.tipo} ya existe para orden ${data.ordenId}`);
            return existente;
        }

        return this.prisma.alertaAutomatica.create({
            data: {
                ordenId: data.ordenId,
                tipo: data.tipo as any,
                prioridad: data.prioridad,
                titulo: data.titulo,
                mensaje: data.mensaje,
                usuarioId: data.usuarioId,
            },
        });
    }

    private calcularDias(fecha: Date): number {
        const hoy = new Date();
        const diff = hoy.getTime() - fecha.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
}
