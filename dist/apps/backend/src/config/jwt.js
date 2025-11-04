import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
export const generateTokenPair = async (payload, deviceInfo) => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ ...payload, device: deviceInfo.device }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    const decoded = jwt.decode(accessToken);
    const expiresAt = new Date(decoded.exp * 1000);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn,
        expiresAt,
    };
};
export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, JWT_REFRESH_SECRET);
};
export const decodeToken = (token) => {
    try {
        const decoded = jose.decodeJwt(token);
        return decoded;
    }
    catch (err) {
        const error = err;
        logger.debug('Error decoding token:', error.message);
        return null;
    }
};
export const generateTokenPair = async (payload, metadata = {}) => {
    try {
        const [accessToken, refreshToken] = await Promise.all([
            generateAccessToken(payload),
            generateRefreshToken(payload, metadata),
        ]);
        const expiresIn = parseExpiration(ACCESS_TOKEN_EXPIRES_IN);
        logger.info(`Token pair generated for user: ${payload.userId}`);
        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        };
    }
    catch (error) {
        const err = error;
        logger.error('Error generating token pair:', err.message);
        throw new Error('Could not generate token pair');
    }
};
const parseExpiration = (expiresIn) => {
    const timeMatch = expiresIn.match(/(\d+)([smhdwy]?)/g);
    if (!timeMatch)
        return 900;
    let totalSeconds = 0;
    for (const part of timeMatch) {
        const match = part.match(/^(\d+)([smhdwy]?)$/);
        if (match) {
            const [, value, unit] = match;
            const num = parseInt(value, 10);
            const units = {
                s: 1,
                m: 60,
                h: 3600,
                d: 86400,
                w: 604800,
                y: 31536000,
            };
            totalSeconds += num * (units[unit] || 1);
        }
    }
    return totalSeconds || 900;
};
export const getTokenTimeRemaining = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || typeof decoded.exp !== 'number')
            return null;
        const now = Math.floor(Date.now() / 1000);
        const remaining = decoded.exp - now;
        return remaining > 0 ? remaining : 0;
    }
    catch {
        return null;
    }
};
export const isTokenExpiringSoon = (token, thresholdSeconds = 300) => {
    const remaining = getTokenTimeRemaining(token);
    return remaining !== null && remaining < thresholdSeconds;
};
export const extractTokenMetadata = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded)
            return null;
        return {
            userId: decoded.userId,
            role: decoded.role,
            sessionId: decoded.sessionId,
            device: decoded.device,
            ip: decoded.ip,
            issuedAt: typeof decoded.iat === 'number' ? new Date(decoded.iat * 1000) : null,
            expiresAt: typeof decoded.exp === 'number' ? new Date(decoded.exp * 1000) : null,
        };
    }
    catch (error) {
        const err = error;
        logger.debug('Error extracting token metadata:', err.message);
        return null;
    }
};
export const TOKEN_CONSTANTS = {
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN,
    ACCESS_TOKEN_SECONDS: parseExpiration(ACCESS_TOKEN_EXPIRES_IN),
    REFRESH_TOKEN_SECONDS: parseExpiration(REFRESH_TOKEN_EXPIRES_IN),
};
//# sourceMappingURL=jwt.js.map