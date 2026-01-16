import type { Prisma } from '@/prisma/client';
import { nullToUndefined } from '@/shared/utils';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BackendCreateContactDto,
  BackendCreateCustomerDto,
  BackendCreateLocationDto,
  CustomerOrdersResponseDto,
  CustomerResponseDto,
  CustomerType,
} from './application/dto/customers.dto';

type CustomerWithRelations = Prisma.ClienteGetPayload<{
  include: {
    contactos: true;
    ubicaciones: true;
  };
}>;

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new customer
   */
  async create(dto: BackendCreateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.prisma.cliente.findUnique({
      where: { nit: dto.nit },
    });

    if (existing) {
      throw new ConflictException(`Ya existe un cliente con NIT ${dto.nit}`);
    }

    const created = await this.prisma.cliente.create({
      data: {
        razonSocial: dto.razonSocial,
        nit: dto.nit,
        tipoCliente: dto.tipoCliente,
        direccion: dto.direccion,
        telefono: dto.telefono,
        email: dto.email,
        activo: true,
        contactos: {
          create: dto.contactos?.map((c: BackendCreateContactDto) => ({
            nombre: c.nombre,
            cargo: c.cargo,
            email: c.email,
            telefono: c.telefono,
            esPrincipal: c.esPrincipal || false,
          })),
        },
        ubicaciones: {
          create: dto.ubicaciones?.map((u: BackendCreateLocationDto) => ({
            nombre: u.nombre,
            direccion: u.direccion,
            ciudad: u.ciudad,
            departamento: u.departamento,
            latitud: u.latitud,
            longitud: u.longitud,
            esPrincipal: u.esPrincipal || false,
          })),
        },
      },
      include: {
        contactos: true,
        ubicaciones: true,
      },
    });

    this.logger.log(`Cliente creado: ${created.id} - ${created.razonSocial}`);

    return this.mapToResponse(created);
  }

  /**
   * Get all customers
   */
  async findAll(activo?: boolean): Promise<CustomerResponseDto[]> {
    const whereClause = activo !== undefined ? { activo } : {};

    const customers = await this.prisma.cliente.findMany({
      where: whereClause,
      include: {
        contactos: true,
        ubicaciones: true,
      },
      orderBy: {
        razonSocial: 'asc',
      },
    });

    return customers.map(customer => this.mapToResponse(customer));
  }

  /**
   * Get customer by ID
   */
  async findById(id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        contactos: true,
        ubicaciones: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return this.mapToResponse(customer);
  }

  /**
   * Add contact to customer
   */
  async addContact(customerId: string, dto: BackendCreateContactDto): Promise<CustomerResponseDto> {
    const customer = await this.prisma.cliente.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${customerId} no encontrado`);
    }

    if (dto.esPrincipal) {
      await this.prisma.contactoCliente.updateMany({
        where: { clienteId: customerId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    await this.prisma.contactoCliente.create({
      data: {
        clienteId: customerId,
        nombre: dto.nombre,
        cargo: dto.cargo,
        email: dto.email,
        telefono: dto.telefono,
        esPrincipal: dto.esPrincipal || false,
      },
    });

    return this.findById(customerId);
  }

  /**
   * Add location to customer
   */
  async addLocation(
    customerId: string,
    dto: BackendCreateLocationDto
  ): Promise<CustomerResponseDto> {
    const customer = await this.prisma.cliente.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${customerId} no encontrado`);
    }

    if (dto.esPrincipal) {
      await this.prisma.ubicacionCliente.updateMany({
        where: { clienteId: customerId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    await this.prisma.ubicacionCliente.create({
      data: {
        clienteId: customerId,
        nombre: dto.nombre,
        direccion: dto.direccion,
        ciudad: dto.ciudad,
        departamento: dto.departamento,
        latitud: dto.latitud,
        longitud: dto.longitud,
        esPrincipal: dto.esPrincipal || false,
      },
    });

    return this.findById(customerId);
  }

  /**
   * Get customer order history
   */
  async getCustomerOrders(customerId: string): Promise<CustomerOrdersResponseDto> {
    const customer = await this.prisma.cliente.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${customerId} no encontrado`);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { clienteId: customerId },
          { cliente: { contains: customer.razonSocial, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        numero: true,
        descripcion: true,
        estado: true,
        prioridad: true,
        createdAt: true,
        fechaFin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      clienteId: customerId,
      razonSocial: customer.razonSocial,
      totalOrdenes: orders.length,
      orders,
    };
  }

  /**
   * Deactivate customer
   */
  async deactivate(id: string): Promise<CustomerResponseDto> {
    try {
      const updated = await this.prisma.cliente.update({
        where: { id },
        data: { activo: false },
        include: {
          contactos: true,
          ubicaciones: true,
        },
      });
      return this.mapToResponse(updated);
    } catch (error) {
      if ((error as any).code === 'P2025') {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  private mapToResponse(customer: CustomerWithRelations): CustomerResponseDto {
    return {
      id: customer.id,
      razonSocial: customer.razonSocial,
      nit: customer.nit,
      tipoCliente: customer.tipoCliente as unknown as CustomerType,
      direccion: nullToUndefined(customer.direccion),
      telefono: nullToUndefined(customer.telefono),
      email: nullToUndefined(customer.email),
      activo: customer.activo,
      contactos:
        customer.contactos?.map(contacto => ({
          id: contacto.id,
          nombre: contacto.nombre,
          cargo: contacto.cargo,
          email: contacto.email,
          telefono: nullToUndefined(contacto.telefono),
          esPrincipal: contacto.esPrincipal,
        })) || [],
      ubicaciones:
        customer.ubicaciones?.map(ubicacion => ({
          id: ubicacion.id,
          nombre: ubicacion.nombre,
          direccion: nullToUndefined(ubicacion.direccion),
          ciudad: nullToUndefined(ubicacion.ciudad),
          departamento: nullToUndefined(ubicacion.departamento),
          latitud: nullToUndefined(ubicacion.latitud),
          longitud: nullToUndefined(ubicacion.longitud),
          esPrincipal: ubicacion.esPrincipal,
        })) || [],
      totalOrdenes: 0,
      createdAt: customer.createdAt.toISOString(),
    };
  }
}
