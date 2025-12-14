/**
 * @repository FormularioRepository
 * Implementación simplificada - almacena en JSON
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IFormularioRepository, CreateFormularioDto, SubmitFormularioDto } from '../../application/dto';

// Almacenamiento temporal en memoria
const formularios: Map<string, any> = new Map();
const respuestas: any[] = [];

@Injectable()
export class FormularioRepository implements IFormularioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<any[]> {
    return Array.from(formularios.values());
  }

  async findById(id: string): Promise<any> {
    return formularios.get(id) || null;
  }

  async findByCategoria(categoria: string): Promise<any[]> {
    return Array.from(formularios.values()).filter(
      (f) => f.categoria === categoria
    );
  }

  async create(data: CreateFormularioDto): Promise<any> {
    const id = `form_${Date.now()}`;
    const formulario = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
    };
    formularios.set(id, formulario);
    return formulario;
  }

  async submitRespuesta(data: SubmitFormularioDto, userId: string): Promise<any> {
    const respuesta = {
      id: `resp_${Date.now()}`,
      formularioId: data.formularioId,
      ordenId: data.ordenId,
      respuestas: data.respuestas,
      userId,
      createdAt: new Date().toISOString(),
    };
    respuestas.push(respuesta);
    return respuesta;
  }

  async getRespuestasByOrden(ordenId: string): Promise<any[]> {
    return respuestas.filter((r) => r.ordenId === ordenId);
  }
}
