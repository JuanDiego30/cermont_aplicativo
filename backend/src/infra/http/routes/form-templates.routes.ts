import { Router } from 'express';
import { FormTemplatesController } from '../controllers/FormTemplatesController.js';
import { FormSubmissionsController } from '../controllers/FormSubmissionsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Middleware global de autenticación para todas las rutas de formularios
router.use(authenticate);

/**
 * @route   GET /api/form-templates
 * @desc    Listar todas las plantillas activas
 * @access  Private
 */
router.get(
  '/',
  authorize([PERMISSIONS.FORMS_VIEW]),
  FormTemplatesController.list
);

/**
 * @route   GET /api/form-templates/meta/categories
 * @desc    Obtener categorías disponibles para formularios
 * @access  Private
 */
router.get('/meta/categories', (req, res) => {
  // Categorías estáticas del sistema
  const categories = [
    { id: 'inspection', name: 'Inspección', icon: 'clipboard-check' },
    { id: 'safety', name: 'Seguridad', icon: 'shield' },
    { id: 'maintenance', name: 'Mantenimiento', icon: 'wrench' },
    { id: 'quality', name: 'Calidad', icon: 'badge-check' },
    { id: 'closing', name: 'Actas de cierre', icon: 'file-signature' },
    { id: 'planning', name: 'Planeación', icon: 'calendar' },
    { id: 'other', name: 'Otros', icon: 'folder' },
  ];
  res.json({ success: true, data: categories });
});

/**
 * @route   GET /api/form-templates/:id
 * @desc    Obtener detalle de una plantilla
 * @access  Private
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.FORMS_VIEW]),
  FormTemplatesController.getById
);

/**
 * @route   POST /api/form-templates
 * @desc    Crear nueva plantilla
 * @access  Private (Admin/Coordinador)
 */
router.post(
  '/',
  authorize([PERMISSIONS.FORMS_MANAGE]),
  FormTemplatesController.create
);

/**
 * @route   PUT /api/form-templates/:id
 * @desc    Actualizar plantilla existente
 * @access  Private (Admin/Coordinador)
 */
router.put(
  '/:id',
  authorize([PERMISSIONS.FORMS_MANAGE]),
  FormTemplatesController.update
);

/**
 * @route   DELETE /api/form-templates/:id
 * @desc    Eliminar plantilla (Soft Delete)
 * @access  Private (Admin/Coordinador)
 */
router.delete(
  '/:id',
  authorize([PERMISSIONS.FORMS_MANAGE]),
  FormTemplatesController.remove
);

// --- Rutas de Submissions (Envíos) anidadas ---

/**
 * @route   POST /api/form-templates/:id/submissions
 * @desc    Enviar un formulario completado basado en la plantilla :id
 * @access  Private
 */
router.post(
  '/:id/submissions',
  authorize([PERMISSIONS.FORMS_SUBMIT]),
  (req, res) => {
    // Inyectar el ID de la plantilla en el body para el controlador de submissions
    req.body.templateId = req.params.id;
    return FormSubmissionsController.create(req, res);
  }
);

/**
 * @route   GET /api/form-templates/:id/submissions
 * @desc    Ver todos los envíos de una plantilla específica
 * @access  Private
 */
router.get(
  '/:id/submissions',
  authorize([PERMISSIONS.FORMS_VIEW_SUBMISSIONS]),
  (req, res) => {
    // Si el controlador soporta filtrado por query param
    req.query.templateId = req.params.id;
    // Redirigir a un método específico si existe, o al list genérico filtrado
    // Suponiendo que FormSubmissionsController tiene un método list genérico que filtra
    // return FormSubmissionsController.list(req, res);
    
    // Como fallback si no hay método específico, retornamos 501 o implementamos lógica custom
    res.status(501).json({ message: 'Listado por plantilla pendiente de implementación en controlador' });
  }
);

/**
 * @route   GET /api/form-templates/submissions/:submissionId
 * @desc    Ver detalle de un envío específico
 * @access  Private
 */
router.get(
  '/submissions/:submissionId',
  authorize([PERMISSIONS.FORMS_VIEW_SUBMISSIONS]),
  (req, res) => {
    req.params.id = req.params.submissionId; // Ajustar param para getById
    return FormSubmissionsController.getById(req, res);
  }
);

/**
 * @route   GET /api/form-templates/:id/pdf
 * @desc    Generar vista previa PDF/HTML de la plantilla vacía
 * @access  Private
 */
router.get(
  '/:id/pdf',
  authorize([PERMISSIONS.FORMS_VIEW]),
  async (req, res) => {
    // Esta lógica idealmente debería estar en el controlador o un servicio de reportes.
    // Por ahora delegamos al getById para obtener datos, el cliente renderiza o
    // se implementa un endpoint específico `generatePdf` en el controlador.
    return FormTemplatesController.getById(req, res);
  }
);

export default router;
