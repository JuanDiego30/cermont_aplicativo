/**
 * Repository: FormSubmissionRepository
 * 
 * Implementación Prisma de IFormSubmissionRepository
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IFormSubmissionRepository } from '../../domain/repositories/form-submission.repository.interface';
import { FormSubmission } from '../../domain/entities/form-submission.entity';
import { FormSubmissionId } from '../../domain/value-objects/form-submission-id.vo';
import { FormTemplateId } from '../../domain/value-objects/form-template-id.vo';

@Injectable()
export class FormSubmissionRepository implements IFormSubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(submission: FormSubmission): Promise<FormSubmission> {
    const prismaData = {
      id: submission.getId().getValue(),
      templateId: submission.getTemplateId().getValue(),
      data: submission.getAnswersObject() as any,
      estado: submission.getStatus().getValue().toLowerCase(),
      completadoPorId: submission.getSubmittedBy(),
      completadoEn: submission.getSubmittedAt(),
      revisadoPorId: submission.getValidatedBy(),
      revisadoEn: submission.getValidatedAt(),
      ordenId: submission.getContextId(),
      createdAt: submission.getCreatedAt(),
      updatedAt: submission.getUpdatedAt(),
    };

    const saved = await this.prisma.formularioInstancia.upsert({
      where: { id: prismaData.id },
      create: prismaData,
      update: {
        data: prismaData.data,
        estado: prismaData.estado as any,
        completadoPorId: prismaData.completadoPorId,
        completadoEn: prismaData.completadoEn,
        revisadoPorId: prismaData.revisadoPorId,
        revisadoEn: prismaData.revisadoEn,
        updatedAt: prismaData.updatedAt,
      },
    });

    return this.fromPrisma(saved);
  }

  async findById(id: FormSubmissionId): Promise<FormSubmission | null> {
    const submission = await this.prisma.formularioInstancia.findUnique({
      where: { id: id.getValue() },
      include: {
        template: true,
      },
    });

    if (!submission) {
      return null;
    }

    return this.fromPrisma(submission);
  }

  async findByTemplate(templateId: FormTemplateId): Promise<FormSubmission[]> {
    const submissions = await this.prisma.formularioInstancia.findMany({
      where: {
        templateId: templateId.getValue(),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });

    return submissions.map((s) => this.fromPrisma(s));
  }

  async findByContext(
    contextType: string,
    contextId: string,
  ): Promise<FormSubmission[]> {
    // Mapear contextType a campo de Prisma
    // Por ahora, asumimos que contextId es ordenId
    const submissions = await this.prisma.formularioInstancia.findMany({
      where: {
        ordenId: contextId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });

    return submissions.map((s) => this.fromPrisma(s));
  }

  async countSubmissions(templateId: FormTemplateId): Promise<number> {
    return this.prisma.formularioInstancia.count({
      where: {
        templateId: templateId.getValue(),
      },
    });
  }

  async findAll(): Promise<FormSubmission[]> {
    const submissions = await this.prisma.formularioInstancia.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
      },
    });

    return submissions.map((s) => this.fromPrisma(s));
  }

  async delete(id: FormSubmissionId): Promise<void> {
    await this.prisma.formularioInstancia.delete({
      where: { id: id.getValue() },
    });
  }

  private fromPrisma(prismaData: any): FormSubmission {
    return FormSubmission.fromPersistence({
      id: prismaData.id,
      templateId: prismaData.templateId,
      templateVersion: prismaData.template?.version || '1.0',
      answers: prismaData.data || {},
      status: prismaData.estado?.toUpperCase() || 'INCOMPLETE',
      contextType: 'orden', // Simplificado
      contextId: prismaData.ordenId,
      submittedBy: prismaData.completadoPorId || '',
      submittedAt: prismaData.completadoEn,
      validatedAt: prismaData.revisadoEn,
      validatedBy: prismaData.revisadoPorId,
      createdAt: prismaData.createdAt,
      updatedAt: prismaData.updatedAt,
    });
  }
}

