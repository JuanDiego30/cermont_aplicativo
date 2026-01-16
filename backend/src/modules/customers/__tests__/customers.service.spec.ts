import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateCustomerDto, CustomerType } from '../application/dto/customers.dto';
import { CustomersService } from '../customers.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: { order: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get(CustomersService);
  });

  it('crea un cliente', async () => {
    const dto: CreateCustomerDto = {
      razonSocial: 'Cliente Demo',
      nit: '900.999.999-1',
      tipoCliente: CustomerType.PETROLERO,
      direccion: 'Calle 123',
      telefono: '+57 300 000 0000',
      email: 'demo@cliente.com',
      contactos: [
        {
          nombre: 'Ana',
          cargo: 'Compras',
          email: 'ana@cliente.com',
          telefono: '+57 300 111 1111',
          esPrincipal: true,
        },
      ],
      ubicaciones: [
        {
          nombre: 'Base',
          direccion: 'Zona industrial',
          ciudad: 'Arauca',
          departamento: 'Arauca',
          latitud: 5.36,
          longitud: -71.79,
          esPrincipal: true,
        },
      ],
    };

    const result = await service.create(dto);

    expect(result.id).toBeDefined();
    expect(result.razonSocial).toBe(dto.razonSocial);
    expect(result.contactos).toHaveLength(1);
    expect(result.ubicaciones).toHaveLength(1);
  });

  it('rechaza NIT duplicado', async () => {
    const dto: CreateCustomerDto = {
      razonSocial: 'Cliente Duplicado',
      nit: '900.888.888-2',
      tipoCliente: CustomerType.COMERCIAL,
    };

    await service.create(dto);
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('encuentra cliente por id', async () => {
    const dto: CreateCustomerDto = {
      razonSocial: 'Cliente Buscar',
      nit: '900.777.777-3',
      tipoCliente: CustomerType.INDUSTRIAL,
    };

    const created = await service.create(dto);
    const found = await service.findById(created.id);

    expect(found.id).toBe(created.id);
    expect(found.nit).toBe(dto.nit);
  });

  it('lanza NotFound cuando el cliente no existe', async () => {
    await expect(service.findById('no-existe')).rejects.toThrow(NotFoundException);
  });

  it('returns customer order history', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'ord-1',
        numero: 'OT-001',
        descripcion: 'Trabajo de prueba',
        estado: 'pendiente',
        prioridad: 'media',
        createdAt: new Date('2024-01-01'),
        fechaFin: null,
      },
    ]);

    const result = await service.getCustomerOrders('sierracol-001');

    expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    expect(result.totalOrdenes).toBe(1);
    expect(result.orders[0].numero).toBe('OT-001');
  });
});
