jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({ size: 10 }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ArchivadoHistoricoService } from '../archivado-historico.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('ArchivadoHistoricoService', () => {
  let service: ArchivadoHistoricoService;
  let prisma: {
    order: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArchivadoHistoricoService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(ArchivadoHistoricoService);
  });

  it('archiva órdenes manualmente', async () => {
    // archivarManual llama a findUnique una vez, luego marcarComoArchivada llama otra vez
    prisma.order.findUnique
      .mockResolvedValueOnce({
        id: 'ord-1',
        numero: 'OT-001',
        observaciones: null,
      })
      .mockResolvedValueOnce({
        id: 'ord-1',
        numero: 'OT-001',
        observaciones: null,
      });
    prisma.order.update.mockResolvedValue({});

    const result = await service.archivarManual({
      ordenesIds: ['ord-1'],
    });

    expect(prisma.order.update).toHaveBeenCalledTimes(1);
    expect(result.ordenesArchivadas).toBe(1);
    expect(result.ordenesOmitidas).toBe(0);
  });

  it('omite orden inexistente en archivado manual', async () => {
    prisma.order.findUnique.mockResolvedValueOnce(null);

    const result = await service.archivarManual({
      ordenesIds: ['ord-404'],
    });

    expect(result.ordenesArchivadas).toBe(0);
    expect(result.ordenesOmitidas).toBe(1);
  });

  it('lanza NotFound al restaurar orden inexistente', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await expect(service.restaurarOrden('ord-x')).rejects.toThrow(NotFoundException);
  });
});
