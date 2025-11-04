import argon2 from 'argon2';
import bcrypt from 'bcryptjs';
import { AppError } from './errorHandler';
import { logUserAction } from './logger';
import { PASSWORD_MIN_LENGTH, HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
const getArgon2Options = () => ({
    type: argon2.argon2id,
    memoryCost: Number(process.env.ARGON2_MEMORY_COST) || 2 ** 16,
    timeCost: Number(process.env.ARGON2_TIME_COST) || 3,
    parallelism: Number(process.env.ARGON2_PARALLELISM) || 1,
    hashLength: 32,
});
export const validatePasswordStrength = (password) => {
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
        throw new AppError(ERROR_MESSAGES.WEAK_PASSWORD, HTTP_STATUS.UNPROCESSABLE_ENTITY, { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: `Must be at least ${PASSWORD_MIN_LENGTH} characters` } });
    }
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pattern.test(password)) {
        throw new AppError(ERROR_MESSAGES.WEAK_PASSWORD, HTTP_STATUS.UNPROCESSABLE_ENTITY, { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: 'Must include upper, lower, number, and special char' } });
    }
    return true;
};
export const hashPassword = async (password) => {
    if (!password) {
        throw new AppError(ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST, { code: ERROR_CODES.VALIDATION_ERROR, details: { field: 'password', message: 'Password required' } });
    }
    validatePasswordStrength(password);
    try {
        const hash = await argon2.hash(password, getArgon2Options());
        return hash;
    }
    catch (err) {
        logUserAction('system', 'PASSWORD_HASH_FAIL', { error: err.message });
        throw new AppError('Failed to hash password', HTTP_STATUS.INTERNAL_SERVER_ERROR, { code: ERROR_CODES.INTERNAL_ERROR });
    }
};
export const verifyPassword = async (hash, password) => {
    if (!hash || !password)
        return false;
    const hashType = detectHashType(hash);
    try {
        if (hashType === 'argon2') {
            return await argon2.verify(hash, password);
        }
        else if (hashType === 'bcrypt') {
            return await bcrypt.compare(password, hash);
        }
        return false;
    }
    catch (err) {
        logUserAction('anonymous', 'PASSWORD_VERIFY_FAIL', { hashType, error: err.message });
        return false;
    }
};
export const detectHashType = (hash) => {
    if (!hash || typeof hash !== 'string' || hash.length < 10)
        return 'unknown';
    if (/^\$argon2(id|i|d)/.test(hash))
        return 'argon2';
    if (/^\$2[aby]\$/.test(hash))
        return 'bcrypt';
    return 'unknown';
};
export const migratePasswordHash = async (user, password, req) => {
    const currentType = detectHashType(user.password);
    if (currentType !== 'bcrypt')
        return;
    try {
        const newHash = await hashPassword(password);
        user.password = newHash;
        await user.save({ validateModifiedOnly: true });
        const userId = user._id.toString();
        logUserAction(userId, 'PASSWORD_MIGRATED', { from: 'bcrypt', to: 'argon2', ip: req?.ip });
    }
    catch (err) {
        logUserAction('system', 'PASSWORD_MIGRATION_FAIL', { userId: user._id.toString(), error: err.message });
        throw new AppError('Migration failed, try again', HTTP_STATUS.INTERNAL_SERVER_ERROR, { code: ERROR_CODES.INTERNAL_ERROR });
    }
};
export const generateTempPassword = (length = 12) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return validatePasswordStrength(password) ? password : generateTempPassword(length);
};
export default { hashPassword, verifyPassword, detectHashType, validatePasswordStrength, migratePasswordHash, generateTempPassword };
//# sourceMappingURL=passwordHash.js.map