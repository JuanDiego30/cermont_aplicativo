import { Test } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../../../../prisma/prisma.service";
import { ChangeOrdenEstadoUseCase } from "../change-orden-estado.use-case";
import { ORDEN_REPOSITORY } from "../../../domain/repositories";
import { OrdenEntity } from "../../../domain/entities";
import { EstadoOrden, PrioridadLevel } from "../../../domain/value-objects";
import { OrdenEstado } from "../../../application/dto/update-orden.dto";

describe("ChangeOrdenEstadoUseCase", () => {
  const ordenId = "orden-1";

  const makeOrden = (estado: EstadoOrden) => {
    const prioridad: PrioridadLevel = "media";
    const persistence: Parameters<typeof OrdenEntity.fromPersistence>[0] = {
      id: ordenId,
      numero: "ORD-000001",
      descripcion: "Orden de prueba para cambio de estado",
      cliente: "Cliente",
      estado,
      prioridad,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    };

    return OrdenEntity.fromPersistence(
      persistence,
      { id: "u1", name: "User" },
      undefined,
    );
  };

  it("registra auditLog y orderStateHistory al cambiar estado", async () => {
    const ordenRepo = {
      findById: jest.fn().mockResolvedValue(makeOrden("pendiente")),
      update: jest.fn().mockImplementation(async (o: OrdenEntity) => o),
    };

    const tx = {
      order: {
        update: jest.fn().mockResolvedValue({
          id: ordenId,
          numero: "ORD-000001",
          descripcion: "Orden de prueba para cambio de estado",
          cliente: "Cliente",
          estado: "planeacion",
          prioridad: "media",
          fechaInicio: null,
          fechaFin: null,
          fechaFinEstimada: null,
          presupuestoEstimado: null,
          creadorId: "u1",
          asignadoId: null,
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          updatedAt: new Date("2025-01-01T00:00:00.000Z"),
          creador: { id: "u1", name: "User" },
          asignado: null,
        }),
      },
      auditLog: { create: jest.fn().mockResolvedValue({ id: "a1" }) },
      orderStateHistory: { create: jest.fn().mockResolvedValue({ id: "h1" }) },
    } as const;

    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation(
          async <T>(fn: (client: typeof tx) => Promise<T> | T) => fn(tx),
        ),
    } satisfies Pick<PrismaService, "$transaction">;

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
      nuevoEstado: OrdenEstado.PLANEACION,
      motivo: "Inicio de planeaci�n",
      usuarioId: "user-1",
      observaciones: "OK",
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
    expect(tx.orderStateHistory.create).toHaveBeenCalledTimes(1);

    const payload = (tx.orderStateHistory.create as jest.Mock).mock.calls[0][0]
      .data;
    expect(payload.ordenId).toBe(ordenId);
    expect(payload.toState).toBe("planeacion_iniciada");
    expect(payload.notas).toBe("Inicio de planeaci�n");
  });
});
