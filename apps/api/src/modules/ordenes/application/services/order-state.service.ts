/**
 * @service OrderStateService
 *
 * Servicio de State Machine para gestionar transiciones de estados de órdenes.
 * Implementa validación, historial y triggers automáticos.
 */
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '.prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

// String literal aliases alineados con los enums de Prisma
type OrderStatus = 'planeacion' | 'ejecucion' | 'pausada' | 'completada' | 'cancelada';
type TipoAlerta =
    | 'ACTA_SIN_FIRMAR'
    | 'SES_PENDIENTE'
    | 'FACTURA_VENCIDA'
    | 'RECURSO_FALTANTE'
    | 'CERTIFICACION_VENCIDA'
    | 'RETRASO_CRONOGRAMA'
    | 'PROPUESTA_SIN_RESPUESTA';
type PrioridadAlerta = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
import {
    OrderSubState,
    isValidTransition,
    getMainStateFromSubState,
    getNextPossibleStates,
    getStepNumber,
} from '../../domain/enums/order-sub-state.enum';

interface TransitionResult {
    success: boolean;
    orden: {
        id: string;
        numero: string;
        estado: string;
        subEstado: string;
        paso: number;
    };
    fromState: string | null;
    toState: string;
    timestamp: Date;
}

@Injectable()
export class OrderStateService {
    private readonly logger = new Logger(OrderStateService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /**
     * Transiciona una orden a un nuevo estado
     */
    async transitionTo(
        ordenId: string,
        toState: OrderSubState,
        userId?: string,
        notas?: string,
        metadata?: Record<string, unknown>,
    ): Promise<TransitionResult> {
        this.logger.log(`Transicionando orden ${ordenId} a ${toState}`);

        // 1. Obtener orden actual
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
        });

        if (!orden) {
            throw new NotFoundException(`Orden ${ordenId} no encontrada`);
        }

        const currentState = orden.subEstado as OrderSubState;

        // 2. Validar transición
        if (!isValidTransition(currentState, toState)) {
            const allowedStates = getNextPossibleStates(currentState);
            throw new BadRequestException(
                `Transición inválida de ${currentState} a ${toState}. Estados permitidos: ${allowedStates.join(', ')}`,
            );
        }

        // 3. Actualizar orden
        const newMainState = getMainStateFromSubState(toState);
        const updatedOrden = await this.prisma.order.update({
            where: { id: ordenId },
            data: {
                subEstado: toState,
                estado: newMainState,
            },
        });

        // 4. Registrar en historial
        await this.prisma.orderStateHistory.create({
            data: {
                ordenId,
                fromState: currentState,
                toState,
                userId,
                notas,
                metadata: metadata
                    ? (metadata as unknown as Prisma.InputJsonValue)
                    : undefined,
            },
        });

        // 5. Emitir evento
        this.eventEmitter.emit('order.state.changed', {
            ordenId,
            fromState: currentState,
            toState,
            userId,
            timestamp: new Date(),
        });

        // 6. Ejecutar triggers automáticos
        await this.executeStateTriggers(ordenId, toState);

        this.logger.log(`Orden ${orden.numero} transicionada de ${currentState} a ${toState}`);

        return {
            success: true,
            orden: {
                id: updatedOrden.id,
                numero: updatedOrden.numero,
                estado: updatedOrden.estado,
                subEstado: updatedOrden.subEstado as string,
                paso: getStepNumber(toState),
            },
            fromState: currentState,
            toState,
            timestamp: new Date(),
        };
    }

    /**
     * Obtiene el historial de estados de una orden
     */
    async getStateHistory(ordenId: string) {
        const history = await this.prisma.orderStateHistory.findMany({
            where: { ordenId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
            },
        });

        return history.map((h: { id: string; fromState: string | null; toState: string; notas: string | null; user: { name: string; email: string } | null; createdAt: Date }) => ({
            id: h.id,
            fromState: h.fromState,
            toState: h.toState,
            notas: h.notas,
            usuario: h.user?.name || 'Sistema',
            fecha: h.createdAt.toISOString(),
        }));
    }

    /**
     * Obtiene información del estado actual de una orden
     */
    async getStateInfo(ordenId: string) {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            select: {
                id: true,
                numero: true,
                estado: true,
                subEstado: true,
            },
        });

        if (!orden) {
            throw new NotFoundException(`Orden ${ordenId} no encontrada`);
        }

        const currentState = orden.subEstado as OrderSubState;

        return {
            ...orden,
            paso: getStepNumber(currentState),
            siguientesEstados: getNextPossibleStates(currentState),
            esFinal: getNextPossibleStates(currentState).length === 0,
        };
    }

    /**
     * Ejecuta triggers automáticos según el estado
     */
    private async executeStateTriggers(ordenId: string, state: OrderSubState) {
        try {
            switch (state) {
                case OrderSubState.PROPUESTA_APROBADA:
                    // Auto-crear planeación vacía si no existe
                    const existingPlaneacion = await this.prisma.planeacion.findUnique({
                        where: { ordenId },
                    });
                    if (!existingPlaneacion) {
                        await this.prisma.planeacion.create({
                            data: {
                                ordenId,
                                estado: 'borrador',
                                cronograma: {},
                                manoDeObra: {},
                            },
                        });
                        this.logger.log(`Planeación auto-creada para orden ${ordenId}`);
                    }
                    break;

                case OrderSubState.ACTA_ELABORADA:
                    // Crear alerta si acta no se firma en 7 días
                    await this.createAlert(
                        ordenId,
                        'ACTA_SIN_FIRMAR',
                        'WARNING',
                        'Acta pendiente de firma',
                        'El acta de entrega lleva más de 7 días sin firmar',
                    );
                    break;

                case OrderSubState.SES_APROBADA:
                    // Calcular comparativa de costos
                    await this.calculateCostComparison(ordenId);
                    break;

                case OrderSubState.PAGO_RECIBIDO:
                    // Marcar orden completada
                    await this.prisma.order.update({
                        where: { id: ordenId },
                        data: {
                            estado: 'completada' as OrderStatus,
                            fechaFin: new Date(),
                        },
                    });
                    this.logger.log(`Orden ${ordenId} marcada como completada`);
                    break;
            }
        } catch (error) {
            this.logger.error(`Error en trigger para estado ${state}:`, error);
        }
    }

    /**
     * Crea una alerta automática
     */
    private async createAlert(
        ordenId: string,
        tipo: TipoAlerta,
        prioridad: PrioridadAlerta,
        titulo: string,
        mensaje: string,
    ) {
        await this.prisma.alertaAutomatica.create({
            data: {
                ordenId,
                tipo,
                prioridad,
                titulo,
                mensaje,
            },
        });
        this.logger.log(`Alerta ${tipo} creada para orden ${ordenId}`);
    }

    /**
     * Calcula comparativa de costos estimados vs reales
     */
    private async calculateCostComparison(ordenId: string) {
        const orden = await this.prisma.order.findUnique({
            where: { id: ordenId },
            include: {
                propuesta: true,
                costos: true,
            },
        });

        if (!orden?.propuesta) return;

        const totalReal = orden.costos.reduce((sum: number, c: { monto: number }) => sum + c.monto, 0);
        const totalEstimado = orden.propuesta.total;
        const varianza = totalEstimado > 0
            ? ((totalReal - totalEstimado) / totalEstimado) * 100
            : 0;

        await this.prisma.comparativaCostos.upsert({
            where: { ordenId },
            create: {
                ordenId,
                estimadoManoObra: orden.propuesta.costoManoObra,
                estimadoMateriales: orden.propuesta.costoMateriales,
                estimadoEquipos: orden.propuesta.costoEquipos,
                estimadoTransporte: orden.propuesta.costoTransporte,
                estimadoOtros: orden.propuesta.otrosCostos,
                totalEstimado,
                totalReal,
                varianzaPorcentaje: varianza,
                margenRealizado: totalEstimado - totalReal,
            },
            update: {
                totalReal,
                varianzaPorcentaje: varianza,
                margenRealizado: totalEstimado - totalReal,
            },
        });

        this.logger.log(`Comparativa de costos calculada para orden ${ordenId}: ${varianza.toFixed(2)}% varianza`);
    }
}
