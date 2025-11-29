import { Router } from 'express';
import { aiAssistantController } from '../controllers/AIAssistantController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';

const router = Router();

// All assistant routes require authentication
router.use(authenticate);

/**
 * @route POST /api/assistant/chat
 * @desc Send message to AI assistant
 * @access Private
 */
// Uso directo porque los métodos del controller están definidos como arrow functions (propiedades de instancia)
router.post('/chat', aiAssistantController.chat);

/**
 * @route GET /api/assistant/status
 * @desc Get AI assistant availability status
 * @access Private
 */
router.get('/status', aiAssistantController.getStatus);

export default router;
