import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
// Importar controlador si existiera, por ahora mocks inline mejorados

const router = Router();

// Middleware global para rutas de checklist
router.use(authenticate);

/**
 * GET /api/checklists
 * Listar todas las plantillas de checklists
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Conectar con ChecklistRepository real
    const templates = [
      {
        id: '1',
        name: 'Inspección Pre-Operacional',
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
          { id: '2', text: 'Verificar limpieza del área', required: true },
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
 * Obtener una plantilla específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = {
      id,
      name: 'Inspección Pre-Operacional',
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
router.post('/', async (req, res) => {
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
