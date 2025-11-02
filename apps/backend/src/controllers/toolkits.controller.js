/**
 * ToolKits Controller
 * @description Manage predefined tool kits for work orders
 */

import ToolKit from '../models/ToolKit.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Get all toolkits with pagination and filters
 * @route GET /api/v1/toolkits
 * @access Private
 */
export const getAllToolKits = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    categoria,
    search,
    isActive = true,
  } = req.query;

  const filter = { isActive };

  // Filter by category
  if (categoria) {
    filter.categoria = categoria;
  }

  // Search across multiple fields
  if (search) {
    filter.$or = [
      { nombre: new RegExp(search, 'i') },
      { descripcion: new RegExp(search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  const [toolkits, total] = await Promise.all([
    ToolKit.find(filter)
      .populate('creadoPor', 'nombre email')
      .sort({ vecesUtilizado: -1, nombre: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ToolKit.countDocuments(filter),
  ]);

  return paginatedResponse(res, toolkits, parseInt(page), parseInt(limit), total);
});

/**
 * Get toolkit by ID
 * @route GET /api/v1/toolkits/:id
 * @access Private
 */
export const getToolKitById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const toolkit = await ToolKit.findById(id).populate('creadoPor', 'nombre email cargo');

  if (!toolkit) {
    return errorResponse(res, 'Kit de herramientas no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, { toolkit }, 'Kit obtenido exitosamente');
});

/**
 * Get toolkits by category
 * @route GET /api/v1/toolkits/category/:categoria
 * @access Private
 */
export const getToolKitsByCategory = asyncHandler(async (req, res) => {
  const { categoria } = req.params;

  const validCategories = ['electrico', 'telecomunicaciones', 'CCTV', 'instrumentacion', 'general'];

  if (!validCategories.includes(categoria)) {
    return errorResponse(
      res,
      `Categoría inválida. Válidas: ${validCategories.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const toolkits = await ToolKit.findByCategory(categoria);

  return successResponse(
    res,
    { toolkits, count: toolkits.length },
    `Kits de ${categoria} obtenidos exitosamente`
  );
});

/**
 * Create new toolkit
 * @route POST /api/v1/toolkits
 * @access Private (Admin, Engineer, Supervisor)
 */
export const createToolKit = asyncHandler(async (req, res) => {
  const toolkitData = {
    ...req.body,
    creadoPor: req.userId,
  };

  // Check if toolkit with same name exists
  const existingToolkit = await ToolKit.findOne({ nombre: toolkitData.nombre });

  if (existingToolkit) {
    return errorResponse(
      res,
      'Ya existe un kit con ese nombre',
      HTTP_STATUS.CONFLICT
    );
  }

  const toolkit = await ToolKit.create(toolkitData);

  logger.info(`ToolKit created: ${toolkit.nombre} by ${req.user.email}`);

  return createdResponse(res, { toolkit }, 'Kit creado exitosamente');
});

/**
 * Update toolkit
 * @route PUT /api/v1/toolkits/:id
 * @access Private (Admin, Engineer, Supervisor)
 */
export const updateToolKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const toolkit = await ToolKit.findById(id);

  if (!toolkit) {
    return errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // Check if trying to update name to an existing one
  if (updates.nombre && updates.nombre !== toolkit.nombre) {
    const existingToolkit = await ToolKit.findOne({ nombre: updates.nombre });
    if (existingToolkit) {
      return errorResponse(
        res,
        'Ya existe un kit con ese nombre',
        HTTP_STATUS.CONFLICT
      );
    }
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (key !== '_id' && key !== 'creadoPor' && key !== 'vecesUtilizado') {
      toolkit[key] = updates[key];
    }
  });

  await toolkit.save();

  logger.info(`ToolKit updated: ${toolkit.nombre} by ${req.user.email}`);

  return successResponse(res, { toolkit }, 'Kit actualizado exitosamente');
});

/**
 * Delete toolkit (soft delete)
 * @route DELETE /api/v1/toolkits/:id
 * @access Private (Admin only)
 */
export const deleteToolKit = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const toolkit = await ToolKit.findById(id);

  if (!toolkit) {
    return errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // Soft delete
  toolkit.isActive = false;
  await toolkit.save();

  logger.info(`ToolKit soft deleted: ${toolkit.nombre} by ${req.user.email}`);

  return successResponse(res, null, 'Kit eliminado exitosamente');
});

/**
 * Increment toolkit usage count
 * @route POST /api/v1/toolkits/:id/use
 * @access Private
 */
export const incrementToolKitUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const toolkit = await ToolKit.findById(id);

  if (!toolkit) {
    return errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  await toolkit.incrementUsage();

  logger.info(`ToolKit used: ${toolkit.nombre} by ${req.user.email}`);

  return successResponse(
    res,
    { toolkit, vecesUtilizado: toolkit.vecesUtilizado },
    'Uso registrado exitosamente'
  );
});

/**
 * Get most used toolkits
 * @route GET /api/v1/toolkits/stats/most-used
 * @access Private (Admin, Engineer)
 */
export const getMostUsedToolKits = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const toolkits = await ToolKit.find({ isActive: true })
    .sort({ vecesUtilizado: -1 })
    .limit(parseInt(limit))
    .populate('creadoPor', 'nombre email')
    .lean();

  return successResponse(
    res,
    { toolkits },
    'Kits más utilizados obtenidos exitosamente'
  );
});

/**
 * Clone toolkit
 * @route POST /api/v1/toolkits/:id/clone
 * @access Private (Admin, Engineer, Supervisor)
 */
export const cloneToolKit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  const originalToolkit = await ToolKit.findById(id);

  if (!originalToolkit) {
    return errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // Check if new name already exists
  const existingToolkit = await ToolKit.findOne({ nombre });

  if (existingToolkit) {
    return errorResponse(
      res,
      'Ya existe un kit con ese nombre',
      HTTP_STATUS.CONFLICT
    );
  }

  // Create clone
  const clonedToolkit = await ToolKit.create({
    nombre,
    descripcion: `Clon de: ${originalToolkit.nombre}`,
    categoria: originalToolkit.categoria,
    herramientas: originalToolkit.herramientas,
    equipos: originalToolkit.equipos,
    elementosSeguridad: originalToolkit.elementosSeguridad,
    creadoPor: req.userId,
  });

  logger.info(`ToolKit cloned: ${originalToolkit.nombre} -> ${nombre} by ${req.user.email}`);

  return createdResponse(res, { toolkit: clonedToolkit }, 'Kit clonado exitosamente');
});

/**
 * Activate/Deactivate toolkit
 * @route PATCH /api/v1/toolkits/:id/toggle-active
 * @access Private (Admin only)
 */
export const toggleToolKitActive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const toolkit = await ToolKit.findById(id);

  if (!toolkit) {
    return errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  toolkit.isActive = !toolkit.isActive;
  await toolkit.save();

  logger.info(
    `ToolKit ${toolkit.isActive ? 'activated' : 'deactivated'}: ${toolkit.nombre} by ${req.user.email}`
  );

  return successResponse(
    res,
    { toolkit },
    `Kit ${toolkit.isActive ? 'activado' : 'desactivado'} exitosamente`
  );
});

/**
 * Get toolkit statistics
 * @route GET /api/v1/toolkits/stats/summary
 * @access Private (Admin, Engineer)
 */
export const getToolKitStats = asyncHandler(async (req, res) => {
  const stats = await ToolKit.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: '$categoria',
        count: { $sum: 1 },
        totalUsage: { $sum: '$vecesUtilizado' },
        avgUsage: { $avg: '$vecesUtilizado' },
      },
    },
    {
      $sort: { totalUsage: -1 },
    },
  ]);

  const totalToolkits = await ToolKit.countDocuments({ isActive: true });
  const totalUsage = await ToolKit.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$vecesUtilizado' } } },
  ]);

  return successResponse(
    res,
    {
      stats,
      summary: {
        totalToolkits,
        totalUsage: totalUsage[0]?.total || 0,
      },
    },
    'Estadísticas obtenidas exitosamente'
  );
});
