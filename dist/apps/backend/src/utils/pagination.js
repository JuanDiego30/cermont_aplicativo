import mongoose, { isValidObjectId } from 'mongoose';
import { AppError } from './errorHandler';
import { PAGINATION, HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import { logDatabaseOperation } from './logger';
const normalizeOptions = (options) => {
    const limit = Math.min(Math.max(Number(options.limit) || PAGINATION.DEFAULT_LIMIT, 1), PAGINATION.MAX_LIMIT);
    const sort = options.sort || { _id: -1 };
    const populate = Array.isArray(options.populate) ? options.populate : [];
    const select = options.select || null;
    return { limit, sort, populate, select };
};
export const sanitizeFilters = (filters) => {
    return { ...filters };
};
const validateCursor = (cursor) => {
    if (!cursor)
        return true;
    if (!isValidObjectId(cursor)) {
        throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'cursor', message: 'Invalid ObjectId' } });
    }
    return true;
};
const normalizeCursorOptions = (options) => {
    validateCursor(options.cursor);
    return { ...normalizeOptions(options), cursor: options.cursor || null };
};
const normalizeOffsetOptions = (options) => {
    const page = Math.max(Number(options.page) || PAGINATION.DEFAULT_PAGE, 1);
    return { ...normalizeOptions(options), page };
};
export const cursorPaginate = async (model, filters = {}, options = {}) => {
    const { limit, sort, populate, select, cursor } = normalizeCursorOptions(options);
    const startTime = Date.now();
    let query = sanitizeFilters(filters);
    if (cursor) {
        const sortKey = typeof sort === 'string' ? sort : Object.keys(sort)[0] || '_id';
        const sortDir = typeof sort === 'string' ? -1 : sort[sortKey];
        const cursorDoc = await model.findById(cursor).select(sortKey).lean().exec();
        const cursorValue = cursorDoc && sortKey in cursorDoc ? cursorDoc[sortKey] : new mongoose.Types.ObjectId(cursor);
        const op = sortDir < 0 ? '$lt' : '$gt';
        query = { ...query, [sortKey]: { [op]: sortKey === '_id' ? new mongoose.Types.ObjectId(cursor) : cursorValue } };
    }
    let queryBuilder = model.find(query).sort(sort).limit(limit + 1).lean();
    if (populate.length > 0) {
        queryBuilder = queryBuilder.populate(populate);
    }
    if (select) {
        queryBuilder = queryBuilder.select(select);
    }
    const results = await queryBuilder.exec();
    const hasMore = results.length > limit;
    const docs = (hasMore ? results.slice(0, limit) : results);
    const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1]._id.toString() : null;
    const duration = Date.now() - startTime;
    logDatabaseOperation('cursorPaginate', model.modelName, { filters: JSON.stringify(filters), cursor, limit, duration, count: docs.length });
    return {
        docs,
        pagination: {
            cursor,
            nextCursor,
            hasMore,
            limit,
            count: docs.length,
        },
    };
};
export const offsetPaginate = async (model, filters = {}, options = {}) => {
    const { limit, sort, populate, select, page } = normalizeOffsetOptions(options);
    const startTime = Date.now();
    const skip = (page - 1) * limit;
    let query = sanitizeFilters(filters);
    const total = await model.countDocuments(query).exec();
    let queryBuilder = model.find(query).sort(sort).skip(skip).limit(limit).lean();
    if (populate.length > 0) {
        queryBuilder = queryBuilder.populate(populate);
    }
    if (select) {
        queryBuilder = queryBuilder.select(select);
    }
    const docs = (await queryBuilder.exec());
    const duration = Date.now() - startTime;
    logDatabaseOperation('offsetPaginate', model.modelName, { filters: JSON.stringify(filters), page, limit, skip, total, duration, count: docs.length });
    return {
        docs,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasMore: page * limit < total,
            count: docs.length,
        },
    };
};
export const autoPaginate = async (model, filters, options = {}) => {
    if ('cursor' in options && options.cursor !== undefined) {
        return cursorPaginate(model, filters, options);
    }
    if ('page' in options && options.page !== undefined) {
        return offsetPaginate(model, filters, options);
    }
    return cursorPaginate(model, filters, { ...options });
};
export default { cursorPaginate, offsetPaginate, autoPaginate };
//# sourceMappingURL=pagination.js.map