import type { Request, Response } from 'express';
import { prisma } from '../../db/prisma.js';
import { logger } from '../../../shared/utils/index.js';

export class FormSubmissionsController {
  
  static create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { templateId, workPlanId, data } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const submission = await prisma.formSubmission.create({
        data: {
          templateId,
          workplanId: workPlanId, // Prisma usa workplanId (minúscula)
          data: data ? JSON.stringify(data) : '{}',
          submittedBy: userId,
        },
      });

      const responseData = {
        ...submission,
        data: typeof submission.data === 'string' ? JSON.parse(submission.data as string) : submission.data
      };

      res.status(201).json(responseData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating form submission', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static listByWorkPlan = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workPlanId } = req.params;

      const submissions = await prisma.formSubmission.findMany({
        where: { workplanId: workPlanId }, // Prisma usa workplanId (minúscula)
        include: {
          template: true,
          submittedByUser: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const parsedSubmissions = submissions.map(s => ({
        ...s,
        data: typeof s.data === 'string' ? JSON.parse(s.data as string) : s.data
      }));

      res.json(parsedSubmissions);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error listing form submissions', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const submission = await prisma.formSubmission.findUnique({
        where: { id },
        include: {
          template: true,
          submittedByUser: {
            select: { name: true, email: true },
          },
        },
      });

      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      const parsedSubmission = {
        ...submission,
        data: typeof submission.data === 'string' ? JSON.parse(submission.data as string) : submission.data
      };

      res.json(parsedSubmission);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting form submission', { error: msg });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
