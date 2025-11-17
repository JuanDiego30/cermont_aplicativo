/**
 * Checklists Routes
 * Rutas para gesti�n de checklists y plantillas
 */

import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

/**
 * GET /api/checklists
 * Listar todas las plantillas de checklists
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // TODO: Implementar con repository cuando est� disponible
    const templates = [
      {
        id: '1',
        name: 'Inspecci�n Pre-Operacional',
        category: 'safety',
        items: [
          { id: '1', text: 'Verificar EPP completo', required: true },
          { id: '2', text: 'Revisar herramientas', required: true },
          { id: '3', text: 'Confirmar permisos de trabajo', required: true },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Checklist de Cierre',
        category: 'operations',
        items: [
          { id: '1', text: 'Documentar actividades realizadas', required: true },
          { id: '2', text: 'Verificar limpieza del �rea', required: true },
          { id: '3', text: 'Entregar herramientas', required: true },
        ],
        createdAt: new Date().toISOString(),
      },
    ];

    res.json({
      success: true,
      data: {
        templates,
        total: templates.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message,
    });
  }
});

/**
 * GET /api/checklists/:id
 * Obtener una plantilla espec�fica
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const template = {
      id,
      name: 'Inspecci�n Pre-Operacional',
      category: 'safety',
      items: [
        { id: '1', text: 'Verificar EPP completo', required: true },
        { id: '2', text: 'Revisar herramientas', required: true },
      ],
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message,
    });
  }
});

/**
 * POST /api/checklists
 * Crear nueva plantilla
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const newTemplate = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error: any) {
    res.status(500).json({
      type: 'https://httpstatuses.com/500',
      title: 'Internal Server Error',
      status: 500,
      detail: error.message,
    });
  }
});

export default router;
