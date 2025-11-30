import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/index.js';

export class FormTemplatesController {
  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, description, schema, category, activityType } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const template = await prisma.formTemplate.create({
        data: {
          name,
          description,
          category,
          activityType,
          schema: schema || {},
          createdBy: userId,
        },
      });

      res.status(201).json(template);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating form template', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static list = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = await prisma.formTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
        },
      });

      res.json(templates);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error listing form templates', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const template = await prisma.formTemplate.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: { name: true, email: true },
          },
        },
      });

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      res.json(template);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting form template', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, schema, isActive, category, activityType } = req.body;

      const updateData: Record<string, unknown> = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (schema) updateData.schema = schema;
      if (category !== undefined) updateData.category = category;
      if (activityType !== undefined) updateData.activityType = activityType;
      if (isActive !== undefined) updateData.isActive = isActive;
      updateData.version = { increment: 1 };

      const template = await prisma.formTemplate.update({
        where: { id },
        data: updateData,
      });

      res.json(template);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating form template', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Soft delete - solo desactivar
      await prisma.formTemplate.update({
        where: { id },
        data: { isActive: false },
      });

      res.status(204).send();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deleting form template', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}