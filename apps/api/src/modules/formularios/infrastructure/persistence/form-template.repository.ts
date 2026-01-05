/**
 * Repository: FormTemplateRepository
 *
 * Implementación Prisma de IFormTemplateRepository
 */

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IFormTemplateRepository } from "../../domain/repositories/form-template.repository.interface";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import { FormTemplateId } from "../../domain/value-objects/form-template-id.vo";
import { FormTemplateMapper } from "../../application/mappers/form-template.mapper";

@Injectable()
export class FormTemplateRepository implements IFormTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(template: FormTemplate): Promise<FormTemplate> {
    const prismaData = FormTemplateMapper.toPrisma(template);

    const saved = await this.prisma.formTemplate.upsert({
      where: { id: prismaData.id },
      create: {
        id: prismaData.id,
        nombre: prismaData.nombre,
        descripcion: prismaData.descripcion,
        version: prismaData.version,
        tipo: prismaData.tipo as any,
        categoria: prismaData.categoria,
        schema: prismaData.schema as any,
        activo: prismaData.activo,
        creadoPorId: prismaData.creadoPorId,
        createdAt: prismaData.createdAt,
        updatedAt: prismaData.updatedAt,
      },
      update: {
        nombre: prismaData.nombre,
        descripcion: prismaData.descripcion,
        version: prismaData.version,
        tipo: prismaData.tipo as any,
        categoria: prismaData.categoria,
        schema: prismaData.schema as any,
        activo: prismaData.activo,
        updatedAt: prismaData.updatedAt,
      },
    });

    return FormTemplateMapper.fromPrisma(saved);
  }

  async findById(id: FormTemplateId): Promise<FormTemplate | null> {
    const template = await this.prisma.formTemplate.findUnique({
      where: { id: id.getValue() },
    });

    if (!template) {
      return null;
    }

    return FormTemplateMapper.fromPrisma(template);
  }

  async findByContext(contextType: string): Promise<FormTemplate[]> {
    const templates = await this.prisma.formTemplate.findMany({
      where: {
        tipo: contextType as any,
        activo: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return templates.map((t) => FormTemplateMapper.fromPrisma(t));
  }

  async findLatestVersion(name: string): Promise<FormTemplate | null> {
    const template = await this.prisma.formTemplate.findFirst({
      where: {
        nombre: name,
        activo: true,
      },
      orderBy: { version: "desc" },
    });

    if (!template) {
      return null;
    }

    return FormTemplateMapper.fromPrisma(template);
  }

  async findAllVersions(name: string): Promise<FormTemplate[]> {
    const templates = await this.prisma.formTemplate.findMany({
      where: {
        nombre: name,
      },
      orderBy: { version: "desc" },
    });

    return templates.map((t) => FormTemplateMapper.fromPrisma(t));
  }

  async exists(name: string): Promise<boolean> {
    const count = await this.prisma.formTemplate.count({
      where: {
        nombre: name,
        activo: true,
      },
    });

    return count > 0;
  }

  async findAllActive(): Promise<FormTemplate[]> {
    const templates = await this.prisma.formTemplate.findMany({
      where: {
        activo: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return templates.map((t) => FormTemplateMapper.fromPrisma(t));
  }

  async findPublished(): Promise<FormTemplate[]> {
    // En Prisma, "published" se determina por activo=true y tener schema válido
    // Esto es simplificado - en producción necesitarías un campo de estado
    const templates = await this.prisma.formTemplate.findMany({
      where: {
        activo: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return templates
      .map((t) => FormTemplateMapper.fromPrisma(t))
      .filter((t) => t.isPublished());
  }

  async delete(id: FormTemplateId): Promise<void> {
    // Soft delete
    await this.prisma.formTemplate.update({
      where: { id: id.getValue() },
      data: { activo: false },
    });
  }
}
