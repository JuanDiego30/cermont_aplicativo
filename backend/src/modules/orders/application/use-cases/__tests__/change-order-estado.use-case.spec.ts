import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { OrderEntity } from '../../../domain/entities';
import { OrderEstado } from '../../../domain/order-state-machine';
import { Order_REPOSITORY } from '../../../domain/repositories';
import { EstadoOrder, PrioridadLevel } from '../../../domain/value-objects';
import { ChangeOrderEstadoUseCase } from '../change-order-estado.use-case';

describe('ChangeOrderEstadoUseCase', () => {
  const orderId = 'Order-1';

  const makeOrder = (estado: EstadoOrder) => {
    const prioridad: PrioridadLevel = 'media';
    const persistence: Parameters<typeof OrderEntity.fromPersistence>[0] = {
      id: orderId,
      numero: 'ORD-000001',
      descripcion: 'Order de prueba para cambio de estado',
      cliente: 'Cliente',
      estado,
      prioridad,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    };

    return OrderEntity.fromPersistence(persistence, { id: 'u1', name: 'User' }, undefined);
  };

  it('registra auditLog y orderStateHistory al cambiar estado', async () => {
    const OrderRepo = {
      findById: jest.fn().mockResolvedValue(makeOrder('pendiente')),
      update: jest.fn().mockImplementation(async (o: OrderEntity) => o),
    };

    const tx = {
      order: {
        update: jest.fn().mockResolvedValue({
          id: orderId,
          numero: 'ORD-000001',
          descripcion: 'Order de prueba para cambio de estado',
          cliente: 'Cliente',
          estado: 'planeacion',
          prioridad: 'media',
          fechaInicio: null,
          fechaFin: null,
          fechaFinEstimada: null,
          presupuestoEstimado: null,
          creadorId: 'u1',
          asignadoId: null,
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2025-01-01T00:00:00.000Z'),
          creador: { id: 'u1', name: 'User' },
          asignado: null,
        }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'a1' }) },
      orderStateHistory: { create: jest.fn().mockResolvedValue({ id: 'h1' }) },
    } as const;

    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation(async <T>(fn: (client: typeof tx) => Promise<T> | T) => fn(tx)),
    } satisfies Pick<PrismaService, '$transaction'>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeOrderEstadoUseCase,
        { provide: Order_REPOSITORY, useValue: OrderRepo },
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    const useCase = moduleRef.get(ChangeOrderEstadoUseCase);

    await useCase.execute(orderId, {
      nuevoEstado: OrderEstado.PLANEACION,
      motivo: 'Inicio de planeación',
      usuarioId: 'user-1',
      observaciones: 'OK',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(tx.orderStateHistory.create).toHaveBeenCalledTimes(1);

    const payload = (tx.orderStateHistory.create as jest.Mock).mock.calls[0][0].data;
    expect(payload.orderId).toBe(orderId);
    expect(payload.toState).toBe('planeacion_iniciada');
    expect(payload.notas).toBe('Inicio de planeaci�n');
  });
});
