import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateClienteDto,
  ClienteResponseDto,
  CreateContactoDto,
  CreateUbicacionDto,
  ClienteOrdenesResponseDto,
  TipoCliente,
} from "./application/dto/clientes.dto";

type ClienteRecord = {
  id: string;
  razonSocial: string;
  nit: string;
  tipoCliente: TipoCliente;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  createdAt: Date;
};

type ContactoRecord = {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono?: string;
  esPrincipal: boolean;
};

type UbicacionRecord = {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  latitud?: number;
  longitud?: number;
  esPrincipal: boolean;
};

/**
 * ClientesService
 *
 * NOTE: This service assumes Cliente model exists in Prisma schema.
 * If not, it will work with a simplified in-memory store or
 * reuse existing models as needed.
 *
 * For full support, add these models to Prisma schema:
 * - Cliente (razonSocial, nit, tipoCliente, etc.)
 * - ContactoCliente
 * - UbicacionCliente
 */
@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  // In-memory store for clients until schema is updated
  private clientes: Map<string, ClienteRecord> = new Map();
  private contactos: Map<string, ContactoRecord[]> = new Map();
  private ubicaciones: Map<string, UbicacionRecord[]> = new Map();

  constructor(private readonly prisma: PrismaService) {
    // Initialize with SIERRACOL ENERGY
    const sierracolId = "sierracol-001";
    this.clientes.set(sierracolId, {
      id: sierracolId,
      razonSocial: "SIERRACOL ENERGY ARAUCA LLC",
      nit: "900.123.456-7",
      tipoCliente: TipoCliente.PETROLERO,
      direccion: "Caño Limón, Arauca",
      telefono: "+57 1 234 5678",
      email: "contacto@sierracol.com",
      activo: true,
      createdAt: new Date(),
    });
    this.contactos.set(sierracolId, [
      {
        id: "contact-001",
        nombre: "Juan Pérez",
        cargo: "Supervisor de Campo",
        email: "juan.perez@sierracol.com",
        telefono: "+57 300 123 4567",
        esPrincipal: true,
      },
    ]);
    this.ubicaciones.set(sierracolId, [
      {
        id: "ubi-001",
        nombre: "Caño Limón",
        direccion: "Campo Caño Limón",
        ciudad: "Arauca",
        departamento: "Arauca",
        latitud: 5.3667,
        longitud: -71.7994,
        esPrincipal: true,
      },
    ]);
  }

  /**
   * Crear nuevo cliente
   */
  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    // Check NIT uniqueness
    for (const cliente of this.clientes.values()) {
      if (cliente.nit === dto.nit) {
        throw new ConflictException(`Ya existe un cliente con NIT ${dto.nit}`);
      }
    }

    const id = `cliente-${Date.now()}`;
    const cliente = {
      id,
      razonSocial: dto.razonSocial,
      nit: dto.nit,
      tipoCliente: dto.tipoCliente,
      direccion: dto.direccion,
      telefono: dto.telefono,
      email: dto.email,
      activo: true,
      createdAt: new Date(),
    };

    this.clientes.set(id, cliente);
    this.contactos.set(id, []);
    this.ubicaciones.set(id, []);

    // Add contacts if provided
    if (dto.contactos) {
      for (const contacto of dto.contactos) {
        await this.addContacto(id, contacto);
      }
    }

    // Add locations if provided
    if (dto.ubicaciones) {
      for (const ubicacion of dto.ubicaciones) {
        await this.addUbicacion(id, ubicacion);
      }
    }

    this.logger.log(`Cliente creado: ${id} - ${dto.razonSocial}`);

    return this.mapToResponse(id);
  }

  /**
   * Obtener todos los clientes
   */
  async findAll(activo?: boolean): Promise<ClienteResponseDto[]> {
    const results: ClienteResponseDto[] = [];

    for (const [id, cliente] of this.clientes.entries()) {
      if (activo !== undefined && cliente.activo !== activo) {
        continue;
      }
      results.push(this.mapToResponse(id));
    }

    return results.sort((a, b) => a.razonSocial.localeCompare(b.razonSocial));
  }

  /**
   * Obtener cliente por ID
   */
  async findById(id: string): Promise<ClienteResponseDto> {
    const cliente = this.clientes.get(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return this.mapToResponse(id);
  }

  /**
   * Agregar contacto a cliente
   */
  async addContacto(
    clienteId: string,
    dto: CreateContactoDto,
  ): Promise<ClienteResponseDto> {
    const cliente = this.clientes.get(clienteId);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const contactos = this.contactos.get(clienteId) || [];

    // If principal, unset others
    if (dto.esPrincipal) {
      contactos.forEach((c) => (c.esPrincipal = false));
    }

    contactos.push({
      id: `contact-${Date.now()}`,
      nombre: dto.nombre,
      cargo: dto.cargo,
      email: dto.email,
      telefono: dto.telefono,
      esPrincipal: dto.esPrincipal || false,
    });

    this.contactos.set(clienteId, contactos);
    return this.findById(clienteId);
  }

  /**
   * Agregar ubicación a cliente
   */
  async addUbicacion(
    clienteId: string,
    dto: CreateUbicacionDto,
  ): Promise<ClienteResponseDto> {
    const cliente = this.clientes.get(clienteId);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const ubicaciones = this.ubicaciones.get(clienteId) || [];

    // If principal, unset others
    if (dto.esPrincipal) {
      ubicaciones.forEach((u) => (u.esPrincipal = false));
    }

    ubicaciones.push({
      id: `ubi-${Date.now()}`,
      nombre: dto.nombre,
      direccion: dto.direccion,
      ciudad: dto.ciudad,
      departamento: dto.departamento,
      latitud: dto.latitud,
      longitud: dto.longitud,
      esPrincipal: dto.esPrincipal || false,
    });

    this.ubicaciones.set(clienteId, ubicaciones);
    return this.findById(clienteId);
  }

  /**
   * Obtener historial de órdenes de cliente
   */
  async getOrdenesCliente(
    clienteId: string,
  ): Promise<ClienteOrdenesResponseDto> {
    const cliente = this.clientes.get(clienteId);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Search orders by client name
    const ordenes = await this.prisma.order.findMany({
      where: {
        cliente: { contains: cliente.razonSocial, mode: "insensitive" },
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
      orderBy: { createdAt: "desc" },
    });

    const response: ClienteOrdenesResponseDto = {
      clienteId,
      razonSocial: cliente.razonSocial,
      totalOrdenes: ordenes.length,
      ordenes,
    };

    return response;
  }

  /**
   * Desactivar cliente
   */
  async desactivar(id: string): Promise<ClienteResponseDto> {
    const cliente = this.clientes.get(id);
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    cliente.activo = false;
    this.clientes.set(id, cliente);

    return this.mapToResponse(id);
  }

  private mapToResponse(id: string): ClienteResponseDto {
    const cliente = this.clientes.get(id)!;
    const contactos = this.contactos.get(id) || [];
    const ubicaciones = this.ubicaciones.get(id) || [];

    return {
      id: cliente.id,
      razonSocial: cliente.razonSocial,
      nit: cliente.nit,
      tipoCliente: cliente.tipoCliente,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.email,
      activo: cliente.activo,
      contactos: contactos.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        cargo: c.cargo,
        email: c.email,
        telefono: c.telefono,
        esPrincipal: c.esPrincipal,
      })),
      ubicaciones: ubicaciones.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        direccion: u.direccion,
        ciudad: u.ciudad,
        departamento: u.departamento,
        latitud: u.latitud,
        longitud: u.longitud,
        esPrincipal: u.esPrincipal,
      })),
      totalOrdenes: 0, // Will be calculated on demand
      createdAt: cliente.createdAt.toISOString(),
    };
  }
}
