/**
 * Checklists Routes
 * Endpoints para gestión de plantillas de checklists
 */

import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

// ============================================================================
// Types
// ============================================================================

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

interface ChecklistTemplate {
  id: string;
  name: string;
  category: string;
  items: ChecklistItem[];
  createdAt: string;
}

// ============================================================================
// Constants
// ============================================================================

const MOCK_TEMPLATES: ChecklistTemplate[] = [
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

// ============================================================================
// Error Handler
// ============================================================================

function sendErrorResponse(res: any, error: any) {
  res.status(500).json({
    type: 'https://httpstatuses.com/500',
    title: 'Internal Server Error',
    status: 500,
    detail: error instanceof Error ? error.message : 'Unknown error',
  });
}

// ============================================================================
// Router Setup
// ============================================================================

const router = Router();

// Global authentication middleware
router.use(authenticate);

// ============================================================================
// Routes
// ============================================================================

/**
 * List all checklist templates
 * GET /api/checklists
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Conectar con ChecklistRepository real
    res.json({
      success: true,
      data: {
        templates: MOCK_TEMPLATES,
        total: MOCK_TEMPLATES.length,
      },
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

/**
 * Get a specific checklist template
 * GET /api/checklists/:id
 * @param {string} id - Template ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = MOCK_TEMPLATES.find((t) => t.id === id) || MOCK_TEMPLATES[0];

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

/**
 * Create a new checklist template
 * POST /api/checklists
 * @body {name, category, items} - Template data
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const newTemplate: ChecklistTemplate = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: newTemplate,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

export default router;
