import type { Request, Response } from 'express';
import { orderRepository } from '../../db/repositories/OrderRepository.js';
import { OrderState } from '../../../domain/entities/Order.js';

export class ReportsController {
  
  static generateActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement activity report generation
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Activity report generation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error generating report',
      });
    }
  };

  static generateActa = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement acta entrega report generation
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Acta entrega report generation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error generating report',
      });
    }
  };

  static generateSES = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement SES report generation
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'SES report generation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error generating report',
      });
    }
  };

  static generateCosts = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement cost report generation
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Cost report generation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error generating report',
      });
    }
  };

  static generateDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Implement dashboard report generation
      res.status(501).json({
        type: 'https://httpstatuses.com/501',
        title: 'Not Implemented',
        status: 501,
        detail: 'Dashboard report generation not yet implemented',
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error generating report',
      });
    }
  };

  static getPendingActas = async (req: Request, res: Response): Promise<void> => {
    try {
      // Obtener órdenes completadas hace más de 12 horas sin acta
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
      
      const orders = await orderRepository.findAll({
        state: OrderState.EJECUCION,
        archived: false,
      });

      // Filtrar órdenes que fueron completadas hace más de 12 horas
      const pendingActas = orders.filter(order => {
        return order.updatedAt && new Date(order.updatedAt) < twelveHoursAgo;
      });

      res.json({
        success: true,
        data: {
          count: pendingActas.length,
          orders: pendingActas,
        },
      });
    } catch (error) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error fetching pending actas',
      });
    }
  };
}

