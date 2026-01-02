import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ChangeOrdenEstadoUseCase } from '../change-orden-estado.use-case';
import { ORDEN_REPOSITORY } from '../../../domain/repositories';
import { OrdenEntity } from '../../../domain/entities';
import { EstadoOrden, PrioridadLevel } from '../../../domain/value-objects';

describe('ChangeOrdenEstadoUseCase', () => {
  const ordenId = 'orden-1';

  const makeOrden = (estado: EstadoOrden) =>
    OrdenEntity.fromPersistence(
      {
        id: ordenId,
        numero: 'ORD-000001',
        descripcion: 'Orden de prueba para cambio de estado',
        cliente: 'Cliente',
        estado,
        prioridad: 'media' as PrioridadLevel,
        createdAt: new Date('2025-01-01T00:00:00.000Z'),
        updatedAt: new Date('2025-01-01T00:00:00.000Z'),
      } as any,
      { id: 'u1', name: 'User' },
      undefined,
    );

  it('registra auditLog y orderStateHistory al cambiar estado', async () => {
    const ordenRepo = {
      findById: jest.fn().mockResolvedValue(makeOrden('pendiente')),
      update: jest.fn().mockImplementation(async (o: OrdenEntity) => o),
    };

    const tx = {
      order: {
        update: jest.fn().mockResolvedValue({
          id: ordenId,
          numero: 'ORD-000001',
          descripcion: 'Orden de prueba para cambio de estado',
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
        } as any),
      },
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'a1' }) },
      orderStateHistory: { create: jest.fn().mockResolvedValue({ id: 'h1' }) },
    };

    const prisma = {
      $transaction: jest.fn().mockImplementation(async (fn: any) => fn(tx)),
    } as unknown as PrismaService;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeOrdenEstadoUseCase,
        { provide: ORDEN_REPOSITORY, useValue: ordenRepo },
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    const useCase = moduleRef.get(ChangeOrdenEstadoUseCase);

    await useCase.execute(ordenId, {
      nuevoEstado: 'planeacion' as any,
      motivo: 'Inicio de planeación',
      usuarioId: 'user-1',
      observaciones: 'OK',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(tx.orderStateHistory.create).toHaveBeenCalledTimes(1);

    const payload = (tx.orderStateHistory.create as jest.Mock).mock.calls[0][0].data;
    expect(payload.ordenId).toBe(ordenId);
    expect(payload.toState).toBe('planeacion_iniciada');
    expect(payload.notas).toBe('Inicio de planeación');
  });
});
