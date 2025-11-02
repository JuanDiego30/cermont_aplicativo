import mongoose from 'mongoose';

/**
 * Paginación cursor-based para queries de MongoDB
 * Más eficiente que skip/limit para grandes datasets
 * 
 * @param {Object} model - Modelo de Mongoose
 * @param {Object} filters - Filtros de búsqueda
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Object>} Resultado paginado
 */
export const cursorPaginate = async (model, filters = {}, options = {}) => {
  const {
    cursor = null,           // Cursor (ID del último documento)
    limit = 20,              // Cantidad de resultados
    sort = { _id: -1 },      // Ordenamiento (por defecto: más recientes primero)
    populate = [],           // Campos a popular
    select = null            // Campos a seleccionar
  } = options;

  // Construir query base
  const query = { ...filters };

  // Agregar cursor si existe (paginación)
  if (cursor) {
    const cursorDoc = await model.findById(cursor).select(Object.keys(sort)[0]);
    
    if (cursorDoc) {
      const sortField = Object.keys(sort)[0];
      const sortValue = cursorDoc[sortField] || cursorDoc._id;
      const sortDirection = sort[sortField];

      // Agregar condición de cursor según dirección de ordenamiento
      if (sortDirection === -1) {
        // Descendente: documentos menores al cursor
        query[sortField] = sortField === '_id'
          ? { $lt: mongoose.Types.ObjectId(cursor) }
          : { $lt: sortValue };
      } else {
        // Ascendente: documentos mayores al cursor
        query[sortField] = sortField === '_id'
          ? { $gt: mongoose.Types.ObjectId(cursor) }
          : { $gt: sortValue };
      }
    }
  }

  // Ejecutar query
  let queryBuilder = model.find(query)
    .sort(sort)
    .limit(parseInt(limit) + 1); // +1 para saber si hay más páginas

  // Aplicar populate si existe
  if (populate && populate.length > 0) {
    populate.forEach(pop => {
      queryBuilder = queryBuilder.populate(pop);
    });
  }

  // Aplicar select si existe
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // Obtener resultados
  const results = await queryBuilder.exec();

  // Verificar si hay más resultados
  const hasMore = results.length > limit;
  const docs = hasMore ? results.slice(0, limit) : results;

  // Obtener cursor del último documento
  const nextCursor = hasMore && docs.length > 0
    ? docs[docs.length - 1]._id.toString()
    : null;

  return {
    docs,
    pagination: {
      cursor: cursor,
      nextCursor,
      hasMore,
      limit: parseInt(limit),
      count: docs.length
    }
  };
};

/**
 * Paginación offset-based tradicional (para compatibilidad)
 * 
 * @param {Object} model - Modelo de Mongoose
 * @param {Object} filters - Filtros de búsqueda
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<Object>} Resultado paginado
 */
export const offsetPaginate = async (model, filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = { _id: -1 },
    populate = [],
    select = null
  } = options;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Contar total de documentos (solo si es necesario)
  const total = await model.countDocuments(filters);

  // Construir query
  let queryBuilder = model.find(filters)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Aplicar populate
  if (populate && populate.length > 0) {
    populate.forEach(pop => {
      queryBuilder = queryBuilder.populate(pop);
    });
  }

  // Aplicar select
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  const docs = await queryBuilder.exec();

  return {
    docs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hasMore: page * limit < total
    }
  };
};

/**
 * Helper para determinar automáticamente qué tipo de paginación usar
 */
export const autoPaginate = async (model, filters, options) => {
  // Si se proporciona cursor, usar cursor-based
  if (options.cursor !== undefined) {
    return cursorPaginate(model, filters, options);
  }
  
  // Si se proporciona page, usar offset-based
  if (options.page !== undefined) {
    return offsetPaginate(model, filters, options);
  }

  // Por defecto, cursor-based
  return cursorPaginate(model, filters, options);
};

export default {
  cursorPaginate,
  offsetPaginate,
  autoPaginate
};