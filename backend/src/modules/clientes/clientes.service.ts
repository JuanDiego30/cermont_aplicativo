import type { Prisma } from '@/prisma/client';
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    ClienteOrdenesResponseDto,
    ClienteResponseDto,
    CreateClienteDto,
    CreateContactoDto,
    CreateUbicacionDto,
    TipoCliente,
} from './application/dto/clientes.dto';

type ClienteWithRelations = Prisma.ClienteGetPayload<{
  include: {
    contactos: true;
    ubicaciones: true;
  };
}>;

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nuevo cliente
   */
  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
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
          create: dto.contactos?.map(c => ({
            nombre: c.nombre,
            cargo: c.cargo,
            email: c.email,
            telefono: c.telefono,
            esPrincipal: c.esPrincipal || false,
          })),
        },
        ubicaciones: {
          create: dto.ubicaciones?.map(u => ({
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
   * Obtener todos los clientes
   */
  async findAll(activo?: boolean): Promise<ClienteResponseDto[]> {
    const whereClause = activo !== undefined ? { activo } : {};

    const clientes = await this.prisma.cliente.findMany({
      where: whereClause,
      include: {
        contactos: true,
        ubicaciones: true,
      },
      orderBy: {
        razonSocial: 'asc',
      },
    });

    return clientes.map(c => this.mapToResponse(c));
  }

  /**
   * Obtener cliente por ID
   */
  async findById(id: string): Promise<ClienteResponseDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        contactos: true,
        ubicaciones: true,
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return this.mapToResponse(cliente);
  }

  /**
   * Agregar contacto a cliente
   */
  async addContacto(clienteId: string, dto: CreateContactoDto): Promise<ClienteResponseDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    if (dto.esPrincipal) {
      // Unset previous principal contact
      await this.prisma.contactoCliente.updateMany({
        where: { clienteId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    await this.prisma.contactoCliente.create({
      data: {
        clienteId,
        nombre: dto.nombre,
        cargo: dto.cargo,
        email: dto.email,
        telefono: dto.telefono,
        esPrincipal: dto.esPrincipal || false,
      },
    });

    return this.findById(clienteId);
  }

  /**
   * Agregar ubicación a cliente
   */
  async addUbicacion(clienteId: string, dto: CreateUbicacionDto): Promise<ClienteResponseDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    if (dto.esPrincipal) {
      // Unset previous principal location
      await this.prisma.ubicacionCliente.updateMany({
        where: { clienteId, esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    await this.prisma.ubicacionCliente.create({
      data: {
        clienteId,
        nombre: dto.nombre,
        direccion: dto.direccion,
        ciudad: dto.ciudad,
        departamento: dto.departamento,
        latitud: dto.latitud,
        longitud: dto.longitud,
        esPrincipal: dto.esPrincipal || false,
      },
    });

    return this.findById(clienteId);
  }

  /**
   * Obtener historial de órdenes de cliente
   */
  async getOrdenesCliente(clienteId: string): Promise<ClienteOrdenesResponseDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Search orders by client name (legacy) OR client relation (future)
    // For now, we keep matching by reasonSocialString as migration is gradual
    // Ideally we should also check clienteId
    const ordenes = await this.prisma.order.findMany({
      where: {
        OR: [
          { clienteId: clienteId },
          { cliente: { contains: cliente.razonSocial, mode: 'insensitive' } },
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
      clienteId,
      razonSocial: cliente.razonSocial,
      totalOrdenes: ordenes.length,
      ordenes,
    };
  }

  /**
   * Desactivar cliente
   */
  async desactivar(id: string): Promise<ClienteResponseDto> {
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
      // Prisma error code for record not found
      if ((error as any).code === 'P2025') {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }
      throw error;
    }
  }

  private mapToResponse(cliente: ClienteWithRelations): ClienteResponseDto {
    return {
      id: cliente.id,
      razonSocial: cliente.razonSocial,
      nit: cliente.nit,
      tipoCliente: cliente.tipoCliente as unknown as TipoCliente,
      direccion: cliente.direccion ?? undefined,
      telefono: cliente.telefono ?? undefined,
      email: cliente.email ?? undefined,
      activo: cliente.activo,
      contactos:
        cliente.contactos?.map(c => ({
          id: c.id,
          nombre: c.nombre,
          cargo: c.cargo,
          email: c.email,
          telefono: c.telefono ?? undefined,
          esPrincipal: c.esPrincipal,
        })) || [],
      ubicaciones:
        cliente.ubicaciones?.map(u => ({
          id: u.id,
          nombre: u.nombre,
          direccion: u.direccion ?? undefined,
          ciudad: u.ciudad ?? undefined,
          departamento: u.departamento ?? undefined,
          latitud: u.latitud ?? undefined,
          longitud: u.longitud ?? undefined,
          esPrincipal: u.esPrincipal,
        })) || [],
      totalOrdenes: 0, // Calculated on demand
      createdAt: cliente.createdAt.toISOString(),
    };
  }
}
