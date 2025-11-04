import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Types } from 'mongoose';
const ajv = new Ajv({ allErrors: true, removeAdditional: 'all', strict: true });
addFormats(ajv);
const ajvCache = new Map();
const auditValidationError = async (req, errors, location) => {
    if (process.env.VALIDATION_AUDIT !== 'true')
        return;
    const userId = req.user?.userId;
    const userEmail = req.user?.email;
    const inputPreview = JSON.stringify(req.body || req.query || req.params).substring(0, 200) || 'N/A';
    logger.warn('[Validation] Errors detected', {
        location,
        errors: errors.slice(0, 5),
        ip: req.ip,
        userId,
        path: req.path,
        input: inputPreview,
    });
    try {
        await createAuditLog({
            userId: userId || null,
            userEmail: userEmail || 'anonymous',
            action: 'VALIDATION_ERROR',
            resource: 'InputValidation',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl,
            method: req.method,
            status: 'FAILED',
            severity: 'HIGH',
            description: `Validation failed: ${errors.length} errors in ${location}`,
            metadata: { location, errors: errors.slice(0, 3), inputTrunc: inputPreview.length > 199 },
        });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown audit error';
        logger.error('[Audit] Validation audit failed', { error: errMsg });
    }
};
const formatErrors = (errObj, type) => {
    if (type === 'joi' && errObj?.details) {
        return errObj.details.map((detail) => ({
            field: detail.path?.join('.') || 'unknown',
            message: detail.message?.replace(/["']/g, '').replace('validation ', ''),
            type: detail.type || 'unknown',
        }));
    }
    else if (type === 'ajv' && errObj?.errors) {
        return errObj.errors.map((err) => {
            const field = err.instancePath.replace(/^\//, '') || err.params?.missingProperty || 'unknown';
            let message = `${field}: inválido`;
            switch (err.keyword) {
                case 'minLength':
                    message = `${field}: mínimo ${err.params?.limit} caracteres`;
                    break;
                case 'maxLength':
                    message = `${field}: máximo ${err.params?.limit} caracteres`;
                    break;
                case 'required':
                    message = `${field}: requerido`;
                    break;
                case 'pattern':
                    message = `${field}: formato inválido`;
                    break;
                case 'type':
                    message = `${field}: tipo debe ser ${err.params?.type}`;
                    break;
                default:
                    message = `${field}: ${err.message || 'inválido'}`;
            }
            return { field, message, type: err.keyword };
        });
    }
    return [{ field: 'unknown', message: 'Error de validación', type: 'unknown' }];
};
export const validateBody = (schema) => {
    return (req, res, next) => {
        if (!req.body || Object.keys(req.body).length === 0)
            return next();
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });
        if (error) {
            const errors = formatErrors(error, 'joi');
            auditValidationError(req, errors, 'body').catch(() => { });
            errorResponse(res, 'Datos inválidos en el cuerpo de la solicitud', HTTP_STATUS.UNPROCESSABLE_ENTITY, { details: errors });
            return;
        }
        req.body = value;
        next();
    };
};
export const validateQuery = (schema) => {
    return (req, res, next) => {
        if (!req.query || Object.keys(req.query).length === 0)
            return next();
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });
        if (error) {
            const errors = formatErrors(error, 'joi');
            auditValidationError(req, errors, 'query').catch(() => { });
            errorResponse(res, 'Parámetros de consulta inválidos', HTTP_STATUS.UNPROCESSABLE_ENTITY, { details: errors });
            return;
        }
        req.query = value;
        next();
    };
};
export const validateParams = (schema) => {
    return (req, res, next) => {
        if (!req.params || Object.keys(req.params).length === 0)
            return next();
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: false,
            convert: true,
        });
        if (error) {
            const errors = formatErrors(error, 'joi');
            auditValidationError(req, errors, 'params').catch(() => { });
            errorResponse(res, 'Parámetros de URL inválidos', HTTP_STATUS.UNPROCESSABLE_ENTITY, { details: errors });
            return;
        }
        req.params = value;
        next();
    };
};
export const validateRequest = (schemas = {}) => {
    return (req, res, next) => {
        const allErrors = [];
        const isJoiSchema = (sch) => sch && typeof sch.validate === 'function';
        const validatePart = (data, sch, location) => {
            if (!sch)
                return { valid: true, errors: [], sanitized: data };
            let result;
            if (isJoiSchema(sch)) {
                const { error, value } = sch.validate(data, { abortEarly: false, stripUnknown: true, convert: true });
                result = error
                    ? { valid: false, errors: formatErrors(error, 'joi'), sanitized: null }
                    : { valid: true, errors: [], sanitized: value };
            }
            else {
                let validate = ajvCache.get(JSON.stringify(sch));
                if (!validate) {
                    try {
                        validate = ajv.compile(sch);
                        ajvCache.set(JSON.stringify(sch), validate);
                    }
                    catch (e) {
                        const eMsg = e instanceof Error ? e.message : 'Unknown compile error';
                        logger.error('[Validation] AJV schema compile fail', { error: eMsg });
                        return { valid: false, errors: [{ field: 'schema', message: 'Schema inválido', type: 'ajv' }], sanitized: data };
                    }
                }
                const valid = validate(data);
                result = valid
                    ? { valid: true, errors: [], sanitized: data }
                    : {
                        valid: false,
                        errors: formatErrors({ errors: validate.errors }, 'ajv'),
                        sanitized: data,
                    };
            }
            if (!result.valid) {
                auditValidationError(req, result.errors, location).catch(() => { });
            }
            return result;
        };
        if (schemas.body) {
            const resBody = validatePart(req.body || {}, schemas.body, 'body');
            if (!resBody.valid)
                allErrors.push(...resBody.errors);
            else
                req.body = resBody.sanitized;
        }
        if (schemas.query) {
            const resQuery = validatePart(req.query || {}, schemas.query, 'query');
            if (!resQuery.valid)
                allErrors.push(...resQuery.errors);
            else
                req.query = resQuery.sanitized;
        }
        if (schemas.params) {
            const resParams = validatePart(req.params || {}, schemas.params, 'params');
            if (!resParams.valid)
                allErrors.push(...resParams.errors);
            else
                req.params = resParams.sanitized;
        }
        if (allErrors.length > 0) {
            const uniqueErrors = [...new Set(allErrors.map(e => JSON.stringify(e)))].map(s => JSON.parse(s));
            logger.warn('[Validation] Request errors', { path: req.path, count: uniqueErrors.length });
            errorResponse(res, 'Solicitud inválida', HTTP_STATUS.UNPROCESSABLE_ENTITY, { details: uniqueErrors, count: uniqueErrors.length });
            return;
        }
        next();
    };
};
export const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id || !Types.ObjectId.isValid(id)) {
            const err = { field: paramName, message: 'ObjectId inválido', type: 'mongoose' };
            logger.warn('[Validation] Invalid ObjectId', { param: paramName, value: id, path: req.path });
            auditValidationError(req, [err], 'params').catch(() => { });
            errorResponse(res, `El parámetro '${paramName}' debe ser un ObjectId válido de MongoDB`, HTTP_STATUS.BAD_REQUEST, { param: paramName });
            return;
        }
        next();
    };
};
export const validatePagination = (options = {}) => {
    const { maxLimit = 100, defaultLimit = 10, defaultPage = 1 } = options;
    return (req, res, next) => {
        let { page = defaultPage, limit = defaultLimit } = req.query;
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);
        if (isNaN(parsedPage) || parsedPage < 1) {
            const err = { field: 'page', message: 'Debe ser ≥1', type: 'number' };
            auditValidationError(req, [err], 'query').catch(() => { });
            errorResponse(res, 'Parámetro "page" inválido (≥1)', HTTP_STATUS.BAD_REQUEST, { details: [err] });
            return;
        }
        if (isNaN(parsedLimit) || parsedLimit < 1) {
            const err = { field: 'limit', message: 'Debe ser ≥1', type: 'number' };
            auditValidationError(req, [err], 'query').catch(() => { });
            errorResponse(res, 'Parámetro "limit" inválido (≥1)', HTTP_STATUS.BAD_REQUEST, { details: [err] });
            return;
        }
        const cappedLimit = parsedLimit > maxLimit ? maxLimit : parsedLimit;
        if (cappedLimit !== parsedLimit) {
            logger.debug('[Pagination] Limit capped', { requested: parsedLimit, capped: maxLimit });
        }
        req.pagination = {
            page: parsedPage,
            limit: cappedLimit,
            skip: (parsedPage - 1) * cappedLimit,
            totalPages: 0,
        };
        next();
    };
};
export const pagSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).allow(''),
    orderBy: Joi.string().valid('createdAt', 'updatedAt', 'title').default('createdAt'),
    orderDir: Joi.string().valid('asc', 'desc').default('desc'),
});
export const idSchema = Joi.object({ id: Joi.string().required() });
export default {
    validateBody,
    validateQuery,
    validateParams,
    validateRequest,
    validateObjectId,
    validatePagination,
    pagSchema,
    idSchema,
};
//# sourceMappingURL=validate.js.map