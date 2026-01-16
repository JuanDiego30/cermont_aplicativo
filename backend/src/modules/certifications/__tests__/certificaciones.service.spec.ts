import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CertificationsService } from '../certifications.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateCertificacionTecnicoDto } from '../application/dto/certificaciones.dto';
import { TipoCertificacionTecnico } from '../domain/value-objects/tipo-certificacion.vo';

describe('CertificationsService', () => {
  let service: CertificationsService;
  let prisma: {
    user: { findUnique: jest.Mock };
    certificado: { create: jest.Mock; findMany: jest.Mock };
  };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      certificado: { create: jest.fn(), findMany: jest.fn() },
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get(CertificationsService);
  });

  it('registra certificación de técnico', async () => {
    const dto: CreateCertificacionTecnicoDto = {
      tecnicoId: 'tec-1',
      tipo: TipoCertificacionTecnico.TRABAJO_ALTURAS,
      entidadCertificadora: 'SENA',
      numeroCertificado: 'CERT-001',
      fechaEmision: '2024-01-01',
      fechaVencimiento: '2025-01-01',
    };

    prisma.user.findUnique.mockResolvedValue({ id: 'tec-1' });
    prisma.certificado.create.mockResolvedValue({
      id: 'cert-1',
      userId: 'tec-1',
      tipo: dto.tipo,
      nombre: 'Trabajo en Alturas',
      entidad: dto.entidadCertificadora,
      numero: dto.numeroCertificado,
      fechaExpedicion: new Date(dto.fechaEmision),
      fechaVencimiento: new Date(dto.fechaVencimiento),
      archivo: null,
      observaciones: null,
    });

    const result = await service.registrarCertificacionTecnico(dto);

    expect(result.tipo).toBe(dto.tipo);
    expect(prisma.certificado.create).toHaveBeenCalledTimes(1);
    expect(events.emit).toHaveBeenCalledWith('certificacion.registrada', {
      certificacionId: expect.any(String),
      tecnicoId: 'tec-1',
      tipo: dto.tipo,
    });
  });

  it('lanza NotFound si técnico no existe', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.registrarCertificacionTecnico({
        tecnicoId: 'tec-404',
        tipo: TipoCertificacionTecnico.ATG,
        entidadCertificadora: 'SENA',
        numeroCertificado: 'CERT-404',
        fechaEmision: '2024-01-01',
        fechaVencimiento: '2025-01-01',
      })
    ).rejects.toThrow(NotFoundException);
  });

  it('obtiene certificaciones por vencer', async () => {
    prisma.certificado.findMany.mockResolvedValue([
      {
        id: 'cert-2',
        tipo: 'TRABAJO_ALTURAS',
        nombre: 'Trabajo en Alturas',
        entidad: 'SENA',
        numero: 'CERT-002',
        fechaExpedicion: new Date('2024-01-01'),
        fechaVencimiento: new Date(),
        archivo: null,
        observaciones: null,
      },
    ]);

    const result = await service.getCertificacionesPorVencer(30);

    expect(result).toHaveLength(1);
    expect(result[0].numeroCertificado).toBe('CERT-002');
  });
});
